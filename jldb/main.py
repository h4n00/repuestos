from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from schemas import ProductoOut, UsuarioCreate, UsuarioOut, PedidoCreate, PedidoOut, EstadoUpdate
from auth import hashear_contrasena
import models
from auth import hashear_contrasena, verificar_contrasena
from schemas import LoginRequest
from schemas import DireccionCreate, DireccionOut
from schemas import CatalogoOut 
import random
from schemas import FacturaCreate, FacturaOut
from auth import hashear_contrasena, verificar_contrasena, crear_token
from auth import obtener_usuario_actual
from fastapi.responses import FileResponse
from fastapi import HTTPException
from reportlab.pdfgen import canvas
from auth import solo_admin
from schemas import HistorialOut
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import os
import shutil
from utils.helpers import normalizar_nombre
from schemas import ProductoCrear, ProductoActualizar
from sqlalchemy import func, extract
from datetime import datetime
from schemas import ProductoCrear, ProductoActualizar, ResenaCrear
from dotenv import load_dotenv
import requests
import base64

# Crea las tablas en MySQL si no existen (no borra las que ya tienes con datos)
Base.metadata.create_all(bind=engine)

# Arriba del archivo, cerca de los imports:
MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

app = FastAPI(title="JL API")

app.mount("/imagenes", StaticFiles(directory="productos"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def obtener_token_paypal():
    """Obtiene un token de acceso de PayPal API v2"""
    client_id = os.getenv("PAYPAL_CLIENT_ID")
    client_secret = os.getenv("PAYPAL_SECRET")

    credenciales = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    respuesta = requests.post(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        headers={
            "Authorization": f"Basic {credenciales}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data="grant_type=client_credentials"
    )

    if respuesta.status_code != 200:
        raise Exception(f"Error al obtener token de PayPal: {respuesta.text}")

    return respuesta.json()["access_token"]


@app.get("/")
def inicio():
    return {"mensaje": "API de JL funcionando"}

@app.get("/productos", response_model=list[ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(models.Producto).all()
    return productos

@app.get("/productos/destacados")
def productos_destacados(db: Session = Depends(get_db)):
    from sqlalchemy import func

    top = db.query(
        models.Producto,
        func.sum(models.Detalle_Pedido.cantidad).label('total_vendido')
    ).join(
        models.Detalle_Pedido, models.Producto.id_producto == models.Detalle_Pedido.id_producto
    ).filter(
        models.Producto.estado == 'Disponible'
    ).group_by(
        models.Producto.id_producto
    ).order_by(
        func.sum(models.Detalle_Pedido.cantidad).desc()
    ).limit(3).all()

    resultado = []
    for producto, _ in top:
        resultado.append({
            "id_producto": producto.id_producto,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": float(producto.precio),
            "stock": producto.stock,
            "imagen_url": producto.imagen_url
        })

    return resultado

@app.get("/productos/{id_producto}")
def obtener_producto(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    compatibilidades = db.query(models.Producto_Compatibilidad).filter(
        models.Producto_Compatibilidad.id_producto == id_producto
    ).all()

    modelos_compatibles = []
    for c in compatibilidades:
        modelo = db.query(models.Catalogo).filter(models.Catalogo.id_catalogo == c.id_modelo).first()
        if modelo:
            marca = db.query(models.Catalogo).filter(models.Catalogo.id_catalogo == modelo.id_padre).first()
            modelos_compatibles.append({
                "marca": marca.nombre if marca else "Desconocida",
                "modelo": modelo.nombre
            })

    return {
        "id_producto": producto.id_producto,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": float(producto.precio),
        "stock": producto.stock,
        "id_categoria": producto.id_categoria,
        "estado": producto.estado,
        "imagen_url": producto.imagen_url,
        "compatibilidad": modelos_compatibles
    }

@app.post("/usuarios", response_model=UsuarioOut)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        contrasena=hashear_contrasena(usuario.contrasena),
        telefono=usuario.telefono,
        estado="Activo"
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario



@app.post("/pedidos", response_model=PedidoOut)
def crear_pedido(pedido: PedidoCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    id_usuario_token = int(usuario_actual["sub"])

    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario_token).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    nuevo_pedido = models.Pedido(
        id_usuario=id_usuario_token,
        id_direccion=pedido.id_direccion,
        estado_actual="Pendiente"
    )
    db.add(nuevo_pedido)
    db.flush()

    direccion = db.query(models.Direccion_Entrega).filter(
        models.Direccion_Entrega.id_direccion == pedido.id_direccion,
        models.Direccion_Entrega.id_usuario == id_usuario_token
    ).first()
    if not direccion:
        db.rollback()
        raise HTTPException(status_code=403, detail="Esa dirección no te pertenece")

    subtotal = 0

    

    for item in pedido.productos:
        producto = db.query(models.Producto).filter(models.Producto.id_producto == item.id_producto).first()

        if not producto:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")

        if producto.stock < item.cantidad:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}")

        producto.stock -= item.cantidad
        subtotal += float(producto.precio) * item.cantidad

        detalle = models.Detalle_Pedido(
            id_pedido=nuevo_pedido.id_pedido,
            id_producto=item.id_producto,
            cantidad=item.cantidad,
            precio_unitario=producto.precio
        )
        db.add(detalle)

    iva = round(subtotal * 0.12, 2)
    total = round(subtotal + iva, 2)
    numero = f"0001-{random.randint(100000, 999999)}"

    nueva_factura = models.Factura(
        id_pedido=nuevo_pedido.id_pedido,
        id_metodo_pago=pedido.id_metodo_pago,
        numero_factura=numero,
        serie="A",
        nit_cliente="CF",
        nombre_facturacion=usuario.nombre,
        subtotal=subtotal,
        iva=iva,
        total=total,
        estado="Emitida"
    )
    db.add(nueva_factura)

    db.commit()
    db.refresh(nueva_factura)
    db.refresh(nuevo_pedido)
    return {
        "id_pedido": nuevo_pedido.id_pedido,
        "id_usuario": nuevo_pedido.id_usuario,
        "id_direccion": nuevo_pedido.id_direccion,
        "estado_actual": nuevo_pedido.estado_actual,
        "numero_factura": nueva_factura.numero_factura,
        "total_factura": float(nueva_factura.total)
    }


@app.put("/pedidos/{id_pedido}/estado", response_model=PedidoOut)
def actualizar_estado_pedido(id_pedido: int, datos: EstadoUpdate, db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido.estado_actual = datos.estado_actual
    db.commit()
    db.refresh(pedido)

    factura = db.query(models.Factura).filter(models.Factura.id_pedido == pedido.id_pedido).first()

    return {
        "id_pedido": pedido.id_pedido,
        "id_usuario": pedido.id_usuario,
        "id_direccion": pedido.id_direccion,
        "estado_actual": pedido.estado_actual,
        "numero_factura": factura.numero_factura if factura else None,
        "total_factura": float(factura.total) if factura else None
    }

@app.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.correo == datos.correo).first()
    if not usuario:
        return {"error": "Usuario no encontrado"}
    if not verificar_contrasena(datos.contrasena, usuario.contrasena):
        return {"error": "Contraseña incorrecta"}
    
    token = crear_token({"sub": str(usuario.id_usuario), "correo": usuario.correo, "rol": usuario.rol})
    return {
        "mensaje": "Login exitoso",
        "access_token": token,
        "token_type": "bearer",
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "rol": usuario.rol
    }

@app.post("/direcciones", response_model=DireccionOut)
def crear_direccion(direccion: DireccionCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    id_usuario_token = int(usuario_actual["sub"])

    nueva_direccion = models.Direccion_Entrega(
        id_usuario=id_usuario_token,
        departamento=direccion.departamento,
        municipio=direccion.municipio,
        direccion_exacta=direccion.direccion_exacta,
        telefono_contacto=direccion.telefono_contacto,
        nota=direccion.nota
    )
    db.add(nueva_direccion)
    db.commit()
    db.refresh(nueva_direccion)
    return nueva_direccion

@app.get("/direcciones/{id_usuario}", response_model=list[DireccionOut])
def listar_direcciones(id_usuario: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    if id_usuario != int(usuario_actual["sub"]):
        raise HTTPException(status_code=403, detail="No tienes permiso para ver estas direcciones")

    direcciones = db.query(models.Direccion_Entrega).filter(
        models.Direccion_Entrega.id_usuario == id_usuario
    ).all()
    return direcciones

@app.get("/catalogo", response_model=list[CatalogoOut])
def listar_catalogo(tipo: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Catalogo)
    if tipo:
        query = query.filter(models.Catalogo.tipo == tipo)
    return query.all()



@app.get("/facturas/mis-facturas", response_model=list[FacturaOut])
def mis_facturas(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    id_usuario = int(usuario_actual["sub"])
    facturas = db.query(models.Factura).join(models.Pedido).filter(
        models.Pedido.id_usuario == id_usuario
    ).all()
    return facturas

@app.get("/facturas/{id_factura}/pdf")
def descargar_factura_pdf(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.enums import TA_CENTER
    from io import BytesIO
    from fastapi.responses import Response

    id_usuario = int(usuario_actual["sub"])

    factura = db.query(models.Factura).filter(models.Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == factura.id_pedido).first()
    if usuario_actual["rol"] != "Admin" and pedido.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta factura")

    cliente = db.query(models.Usuario).filter(models.Usuario.id_usuario == pedido.id_usuario).first()
    direccion = db.query(models.Direccion_Entrega).filter(
        models.Direccion_Entrega.id_direccion == pedido.id_direccion
    ).first()
    detalles = db.query(models.Detalle_Pedido).filter(
        models.Detalle_Pedido.id_pedido == pedido.id_pedido
    ).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=1.5*cm, bottomMargin=1.5*cm, leftMargin=2*cm, rightMargin=2*cm)
    elementos = []
    estilos = getSampleStyleSheet()

    color_naranja = colors.HexColor("#EA580C")
    color_gris = colors.HexColor("#6B7280")

    estilo_empresa = ParagraphStyle('empresa', parent=estilos['Normal'], fontSize=18, textColor=color_naranja, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=6)
    estilo_datos_empresa = ParagraphStyle('datosEmpresa', parent=estilos['Normal'], fontSize=9, textColor=color_gris, alignment=TA_CENTER, spaceAfter=2)
    estilo_seccion = ParagraphStyle('seccion', parent=estilos['Normal'], fontSize=11, textColor=colors.HexColor("#1F2937"), fontName='Helvetica-Bold', spaceAfter=6)
    estilo_normal = ParagraphStyle('normal', parent=estilos['Normal'], fontSize=10, textColor=colors.HexColor("#374151"))

    # ENCABEZADO
    elementos.append(Paragraph("JL REPUESTOS", estilo_empresa))
    elementos.append(Paragraph("5a Avenida 12-34, Zona 1, Ciudad de Guatemala", estilo_datos_empresa))
    elementos.append(Paragraph("Tel: +502 5555-5555 | correo@jlrepuestos.gt | NIT: 1234567-8", estilo_datos_empresa))
    elementos.append(Spacer(1, 0.5*cm))

    # Línea decorativa
    linea = Table([['']], colWidths=[17*cm], rowHeights=[0.05*cm])
    linea.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), color_naranja)]))
    elementos.append(linea)
    elementos.append(Spacer(1, 0.4*cm))

    # DATOS DE LA FACTURA
    elementos.append(Paragraph("Datos de la Factura", estilo_seccion))
    elementos.append(Paragraph(f"<b>Número:</b> {factura.numero_factura}", estilo_normal))
    elementos.append(Paragraph(f"<b>Fecha de emisión:</b> {factura.fecha_emision.strftime('%d/%m/%Y %H:%M')}", estilo_normal))
    elementos.append(Paragraph(f"<b>Estado:</b> {factura.estado}", estilo_normal))
    elementos.append(Spacer(1, 0.5*cm))

    # DATOS DEL CLIENTE
    elementos.append(Paragraph("Cliente", estilo_seccion))
    elementos.append(Paragraph(f"<b>Nombre:</b> {cliente.nombre}", estilo_normal))
    elementos.append(Paragraph(f"<b>Correo:</b> {cliente.correo}", estilo_normal))
    if direccion:
        elementos.append(Paragraph(f"<b>Dirección de entrega:</b> {direccion.direccion_exacta}, {direccion.municipio}, {direccion.departamento}", estilo_normal))
    elementos.append(Spacer(1, 0.5*cm))

    # TABLA DE PRODUCTOS
    elementos.append(Paragraph("Detalle de productos", estilo_seccion))

    datos_tabla = [['Cant.', 'Descripción', 'P. Unitario', 'Subtotal']]
    subtotal = 0
    for d in detalles:
        producto = db.query(models.Producto).filter(models.Producto.id_producto == d.id_producto).first()
        nombre_producto = producto.nombre if producto else "Producto eliminado"
        subtotal_linea = float(d.precio_unitario) * d.cantidad
        subtotal += subtotal_linea
        datos_tabla.append([
            str(d.cantidad),
            nombre_producto,
            f"Q {float(d.precio_unitario):.2f}",
            f"Q {subtotal_linea:.2f}"
        ])

    tabla = Table(datos_tabla, colWidths=[1.5*cm, 9*cm, 3*cm, 3*cm])
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), color_naranja),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor("#374151")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    elementos.append(tabla)
    elementos.append(Spacer(1, 0.5*cm))

    # TOTALES calculados desde el subtotal
    iva_calculado = subtotal * 0.12
    total_calculado = subtotal + iva_calculado

    totales_datos = [
        ['Subtotal:', f"Q {subtotal:.2f}"],
        ['IVA (12%):', f"Q {iva_calculado:.2f}"],
        ['TOTAL:', f"Q {total_calculado:.2f}"]
    ]
    tabla_totales = Table(totales_datos, colWidths=[13*cm, 3.5*cm])
    tabla_totales.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, 1), 10),
        ('TEXTCOLOR', (0, 0), (-1, 1), colors.HexColor("#374151")),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 2), (-1, 2), 13),
        ('TEXTCOLOR', (0, 2), (-1, 2), color_naranja),
        ('LINEABOVE', (0, 2), (-1, 2), 1, color_naranja),
        ('TOPPADDING', (0, 2), (-1, 2), 8),
    ]))
    elementos.append(tabla_totales)
    elementos.append(Spacer(1, 1*cm))

    # PIE DE PÁGINA
    estilo_footer = ParagraphStyle('footer', parent=estilos['Normal'], fontSize=9, textColor=color_gris, alignment=TA_CENTER, spaceAfter=2)
    elementos.append(Paragraph("¡Gracias por su compra!", estilo_footer))
    elementos.append(Paragraph("Este documento es una representación digital de su factura.", estilo_footer))

    doc.build(elementos)
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=factura_{factura.numero_factura}.pdf"}
    )

@app.get("/pedidos/{id_pedido}/tracking", response_model=list[HistorialOut])
def tracking_pedido(id_pedido: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.id_usuario != int(usuario_actual["sub"]):
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")

    historial = db.query(models.Historial_Estado_Pedido).filter(
        models.Historial_Estado_Pedido.id_pedido == id_pedido
    ).order_by(models.Historial_Estado_Pedido.fecha_hora).all()

    return historial

@app.get("/pedidos/mis-pedidos")
def mis_pedidos(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    id_usuario = int(usuario_actual["sub"])
    
    pedidos = db.query(models.Pedido).filter(
        models.Pedido.id_usuario == id_usuario
    ).order_by(models.Pedido.fecha_pedido.desc()).all()

    resultado = []
    for p in pedidos:
        factura = db.query(models.Factura).filter(models.Factura.id_pedido == p.id_pedido).first()
        detalles = db.query(models.Detalle_Pedido).filter(models.Detalle_Pedido.id_pedido == p.id_pedido).all()

        productos = []
        for d in detalles:
            producto = db.query(models.Producto).filter(models.Producto.id_producto == d.id_producto).first()
            productos.append({
                "nombre": producto.nombre if producto else "Producto eliminado",
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal": float(d.precio_unitario) * d.cantidad
            })

        resultado.append({
            "id_pedido": p.id_pedido,
            "fecha_pedido": p.fecha_pedido,
            "estado_actual": p.estado_actual,
            "productos": productos,
            "id_factura": factura.id_factura if factura else None,
            "numero_factura": factura.numero_factura if factura else None,
            "total": float(factura.total) if factura else 0
        })

    return resultado

@app.get("/pedidos/todos")
def todos_los_pedidos(db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    pedidos = db.query(models.Pedido).order_by(models.Pedido.fecha_pedido.desc()).all()

    resultado = []
    for p in pedidos:
        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == p.id_usuario).first()
        factura = db.query(models.Factura).filter(models.Factura.id_pedido == p.id_pedido).first()

        resultado.append({
            "id_pedido": p.id_pedido,
            "fecha_pedido": p.fecha_pedido,
            "estado_actual": p.estado_actual,
            "cliente": usuario.nombre if usuario else "Desconocido",
            "correo_cliente": usuario.correo if usuario else "",
            "numero_factura": factura.numero_factura if factura else None,
            "total": float(factura.total) if factura else 0
        })

    return resultado

@app.post("/admin/subir-imagen")
def subir_imagen(
    id_producto: int,
    nombre_producto: str,
    id_categoria: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(solo_admin)
):
    # Validar formato del archivo
    extension = archivo.filename.split('.')[-1].lower()
    if extension not in ['jpg', 'jpeg', 'png']:
        raise HTTPException(status_code=400, detail="Solo se permiten archivos JPG o PNG")

    # Buscar la categoría en Catalogo para saber en qué carpeta guardar
    categoria = db.query(models.Catalogo).filter(
        models.Catalogo.id_catalogo == id_categoria,
        models.Catalogo.tipo == 'Categoria'
    ).first()

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Normalizar el nombre de la carpeta (categoría)
    carpeta_categoria = normalizar_nombre(categoria.nombre)

    # Normalizar el nombre del archivo
    nombre_archivo = normalizar_nombre(nombre_producto)
    nombre_final = f"{nombre_archivo}-{id_producto}.{extension}"

    # Crear la carpeta si no existe
    ruta_carpeta = f"productos/{carpeta_categoria}"
    os.makedirs(ruta_carpeta, exist_ok=True)

    # Guardar el archivo
    ruta_completa = f"{ruta_carpeta}/{nombre_final}"
    with open(ruta_completa, 'wb') as f:
        shutil.copyfileobj(archivo.file, f)

    # Devolver la ruta relativa que se guarda en la base de datos
    ruta_bd = f"{carpeta_categoria}/{nombre_final}"

    return {"imagen_url": ruta_bd}


@app.post("/admin/productos")
def crear_producto(producto: ProductoCrear, db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    nuevo = models.Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock=producto.stock,
        id_categoria=producto.id_categoria,
        estado=producto.estado,
        imagen_url=producto.imagen_url
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    for id_modelo in producto.compatibilidad_ids:
        comp = models.Producto_Compatibilidad(
            id_producto=nuevo.id_producto,
            id_modelo=id_modelo
        )
        db.add(comp)

    db.commit()
    return {"id_producto": nuevo.id_producto, "mensaje": "Producto creado"}


@app.put("/admin/productos/{id_producto}")
def actualizar_producto(id_producto: int, datos: ProductoActualizar, db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if datos.nombre is not None: producto.nombre = datos.nombre
    if datos.descripcion is not None: producto.descripcion = datos.descripcion
    if datos.precio is not None: producto.precio = datos.precio
    if datos.stock is not None: producto.stock = datos.stock
    if datos.id_categoria is not None: producto.id_categoria = datos.id_categoria
    if datos.estado is not None: producto.estado = datos.estado
    if datos.imagen_url is not None: producto.imagen_url = datos.imagen_url

    if datos.compatibilidad_ids is not None:
        db.query(models.Producto_Compatibilidad).filter(
            models.Producto_Compatibilidad.id_producto == id_producto
        ).delete()
        for id_modelo in datos.compatibilidad_ids:
            comp = models.Producto_Compatibilidad(
                id_producto=id_producto,
                id_modelo=id_modelo
            )
            db.add(comp)

    db.commit()
    return {"mensaje": "Producto actualizado"}


@app.delete("/admin/productos/{id_producto}")
def eliminar_producto(id_producto: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Verificar si el producto tiene ventas registradas
    ventas = db.query(models.Detalle_Pedido).filter(models.Detalle_Pedido.id_producto == id_producto).first()
    if ventas:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar. Este producto tiene ventas registradas. Marca su estado como 'Descontinuado' en su lugar."
        )

    # Borrar compatibilidades primero
    db.query(models.Producto_Compatibilidad).filter(
        models.Producto_Compatibilidad.id_producto == id_producto
    ).delete()

    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado"}

@app.get("/admin/stock-bajo")
def productos_stock_bajo(db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    LIMITE_STOCK_BAJO = 10
    productos = db.query(models.Producto).filter(
        models.Producto.stock <= LIMITE_STOCK_BAJO,
        models.Producto.estado == 'Disponible'
    ).order_by(models.Producto.stock.asc()).all()

    return [
        {
            "id_producto": p.id_producto,
            "nombre": p.nombre,
            "stock": p.stock,
            "precio": float(p.precio)
        }
        for p in productos
    ]

@app.get("/admin/estadisticas")
def estadisticas_dashboard(db: Session = Depends(get_db), usuario_actual: dict = Depends(solo_admin)):
    ahora = datetime.now()
    mes_actual = ahora.month
    anio_actual = ahora.year

    # 1. Ventas del mes (suma de totales de facturas emitidas este mes)
    ventas_mes = db.query(func.coalesce(func.sum(models.Factura.total), 0)).filter(
        extract('month', models.Factura.fecha_emision) == mes_actual,
        extract('year', models.Factura.fecha_emision) == anio_actual,
        models.Factura.estado == 'Emitida'
    ).scalar()

    # 2. Total de pedidos del mes
    pedidos_mes = db.query(func.count(models.Pedido.id_pedido)).filter(
        extract('month', models.Pedido.fecha_pedido) == mes_actual,
        extract('year', models.Pedido.fecha_pedido) == anio_actual
    ).scalar()

    # 3. Pedidos pendientes (no entregados ni cancelados)
    pedidos_pendientes = db.query(func.count(models.Pedido.id_pedido)).filter(
        models.Pedido.estado_actual.notin_(['Entregado', 'Cancelado'])
    ).scalar()

    # 4. Top 3 productos más vendidos (histórico)
    top_productos = db.query(
        models.Producto.nombre,
        func.sum(models.Detalle_Pedido.cantidad).label('total_vendido')
    ).join(
        models.Detalle_Pedido, models.Producto.id_producto == models.Detalle_Pedido.id_producto
    ).group_by(
        models.Producto.id_producto, models.Producto.nombre
    ).order_by(
        func.sum(models.Detalle_Pedido.cantidad).desc()
    ).limit(3).all()

    return {
        "ventas_mes": float(ventas_mes),
        "pedidos_mes": pedidos_mes,
        "pedidos_pendientes": pedidos_pendientes,
        "top_productos": [
            {"nombre": nombre, "cantidad": int(cantidad)}
            for nombre, cantidad in top_productos
        ],
        "mes_actual": f"{MESES_ES[ahora.month - 1]} {ahora.year}"
    }

@app.post("/resenas")
def crear_o_actualizar_resena(
    datos: ResenaCrear,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    id_usuario = int(usuario_actual["sub"])

    # Validar calificación entre 1 y 5
    if datos.calificacion < 1 or datos.calificacion > 5:
        raise HTTPException(status_code=400, detail="La calificación debe ser entre 1 y 5")

    # Verificar que el usuario haya comprado el producto
    compra = db.query(models.Detalle_Pedido).join(
        models.Pedido, models.Detalle_Pedido.id_pedido == models.Pedido.id_pedido
    ).filter(
        models.Pedido.id_usuario == id_usuario,
        models.Detalle_Pedido.id_producto == datos.id_producto
    ).first()

    if not compra:
        raise HTTPException(status_code=403, detail="Solo puedes reseñar productos que has comprado")

    # Verificar si ya existe reseña de este usuario para este producto
    resena_existente = db.query(models.Resena).filter(
        models.Resena.id_usuario == id_usuario,
        models.Resena.id_producto == datos.id_producto
    ).first()

    if resena_existente:
        # Actualizar la reseña existente
        resena_existente.calificacion = datos.calificacion
        resena_existente.comentario = datos.comentario
        resena_existente.fecha = datetime.now()
        db.commit()
        return {"mensaje": "Reseña actualizada", "id_resena": resena_existente.id_resena}

    # Crear reseña nueva
    nueva = models.Resena(
        id_usuario=id_usuario,
        id_producto=datos.id_producto,
        calificacion=datos.calificacion,
        comentario=datos.comentario
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {"mensaje": "Reseña creada", "id_resena": nueva.id_resena}


@app.get("/productos/{id_producto}/resenas")
def listar_resenas(
    id_producto: int,
    pagina: int = 1,
    db: Session = Depends(get_db)
):
    POR_PAGINA = 3
    offset = (pagina - 1) * POR_PAGINA

    # Contar total
    total = db.query(models.Resena).filter(models.Resena.id_producto == id_producto).count()

    # Obtener reseñas paginadas
    resenas = db.query(models.Resena).filter(
        models.Resena.id_producto == id_producto
    ).order_by(models.Resena.fecha.desc()).offset(offset).limit(POR_PAGINA).all()

    # Obtener nombre de usuario para cada reseña
    resultado = []
    for r in resenas:
        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == r.id_usuario).first()
        resultado.append({
            "id_resena": r.id_resena,
            "id_usuario": r.id_usuario,
            "nombre_usuario": usuario.nombre if usuario else "Anónimo",
            "calificacion": r.calificacion,
            "comentario": r.comentario,
            "fecha": r.fecha
        })

    # Calcular promedio y total general
    from sqlalchemy import func
    promedio = db.query(func.avg(models.Resena.calificacion)).filter(
        models.Resena.id_producto == id_producto
    ).scalar()

    return {
        "resenas": resultado,
        "total": total,
        "pagina": pagina,
        "total_paginas": (total + POR_PAGINA - 1) // POR_PAGINA,
        "promedio": float(promedio) if promedio else 0
    }


@app.get("/productos/{id_producto}/puede-resenar")
def puede_resenar(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    id_usuario = int(usuario_actual["sub"])

    # Verificar si compró el producto
    compra = db.query(models.Detalle_Pedido).join(
        models.Pedido, models.Detalle_Pedido.id_pedido == models.Pedido.id_pedido
    ).filter(
        models.Pedido.id_usuario == id_usuario,
        models.Detalle_Pedido.id_producto == id_producto
    ).first()

    # Verificar si ya tiene reseña
    resena_existente = db.query(models.Resena).filter(
        models.Resena.id_usuario == id_usuario,
        models.Resena.id_producto == id_producto
    ).first()

    return {
        "puede_resenar": compra is not None,
        "ya_reseno": resena_existente is not None,
        "mi_resena": {
            "calificacion": resena_existente.calificacion,
            "comentario": resena_existente.comentario
        } if resena_existente else None
    }

@app.post("/pagos/crear-orden")
def crear_orden_paypal(
    datos: dict,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    from decimal import Decimal
    productos_carrito = datos.get("productos", [])

    if not productos_carrito:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    subtotal = Decimal("0.00")
    items_paypal = []
    for item in productos_carrito:
        producto = db.query(models.Producto).filter(
            models.Producto.id_producto == item["id_producto"]
        ).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item['id_producto']} no encontrado")

        cantidad = int(item["cantidad"])
        precio = Decimal(str(producto.precio))
        subtotal += precio * cantidad

        items_paypal.append({
            "name": producto.nombre[:127],
            "unit_amount": {"currency_code": "USD", "value": f"{float(precio):.2f}"},
            "quantity": str(cantidad)
        })

    iva = (subtotal * Decimal("0.12")).quantize(Decimal("0.01"))
    total = (subtotal + iva).quantize(Decimal("0.01"))

    token = obtener_token_paypal()

    respuesta = requests.post(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": f"{float(total):.2f}",
                    "breakdown": {
                        "item_total": {"currency_code": "USD", "value": f"{float(subtotal):.2f}"},
                        "tax_total": {"currency_code": "USD", "value": f"{float(iva):.2f}"}
                    }
                },
                "items": items_paypal
            }]
        }
    )

    if respuesta.status_code not in [200, 201]:
        raise HTTPException(status_code=500, detail=f"Error PayPal: {respuesta.text}")

    return {"id_orden_paypal": respuesta.json()["id"]}


@app.post("/pagos/capturar")
def capturar_pago(
    datos: dict,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    id_orden_paypal = datos.get("id_orden_paypal")
    id_direccion = datos.get("id_direccion")
    id_metodo_pago = datos.get("id_metodo_pago", 2)
    productos_carrito = datos.get("productos", [])

    if not all([id_orden_paypal, id_direccion, productos_carrito]):
        raise HTTPException(status_code=400, detail="Faltan datos requeridos")

    id_usuario = int(usuario_actual["sub"])

    # Capturar el pago en PayPal API v2
    token = obtener_token_paypal()
    respuesta = requests.post(
        f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{id_orden_paypal}/capture",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )

    if respuesta.status_code not in [200, 201]:
        raise HTTPException(status_code=400, detail=f"Error al capturar pago: {respuesta.text}")

    # Crear pedido en la BD
    try:
        nuevo_pedido = models.Pedido(
            id_usuario=id_usuario,
            id_direccion=id_direccion,
            estado_actual="Pendiente"
        )
        db.add(nuevo_pedido)
        db.flush()

        subtotal_total = 0
        for item in productos_carrito:
            producto = db.query(models.Producto).filter(
                models.Producto.id_producto == item["id_producto"]
            ).first()
            if not producto or producto.stock < item["cantidad"]:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre if producto else 'producto'}")

            detalle = models.Detalle_Pedido(
                id_pedido=nuevo_pedido.id_pedido,
                id_producto=item["id_producto"],
                cantidad=item["cantidad"],
                precio_unitario=producto.precio
            )
            db.add(detalle)

            producto.stock -= item["cantidad"]
            subtotal_total += float(producto.precio) * item["cantidad"]

        import random
        numero_factura = f"0001-{random.randint(100000, 999999)}"
        iva_total = round(subtotal_total * 0.12, 2)
        total_total = round(subtotal_total + iva_total, 2)

        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()

        nueva_factura = models.Factura(
            id_pedido=nuevo_pedido.id_pedido,
            id_metodo_pago=id_metodo_pago,
            numero_factura=numero_factura,
            serie="A",
            nit_cliente="CF",
            nombre_facturacion=usuario.nombre,
            subtotal=subtotal_total,
            iva=iva_total,
            total=total_total,
            estado="Emitida",
            referencia_transaccion=id_orden_paypal
        )
        db.add(nueva_factura)
        db.commit()

        return {
            "mensaje": "Pago exitoso y pedido creado",
            "id_pedido": nuevo_pedido.id_pedido,
            "numero_factura": numero_factura,
            "total_factura": total_total
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear pedido: {str(e)}")