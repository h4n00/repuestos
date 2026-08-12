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

# Crea las tablas en MySQL si no existen (no borra las que ya tienes con datos)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "API de JL funcionando"}

@app.get("/productos", response_model=list[ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(models.Producto).all()
    return productos

@app.get("/productos/{id_producto}", response_model=ProductoOut)
def obtener_producto(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

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
        "nombre": usuario.nombre
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

@app.get("/facturas/{id_factura}/pdf")
def descargar_factura_pdf(id_factura: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    factura = db.query(models.Factura).filter(models.Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    pedido = db.query(models.Pedido).filter(models.Pedido.id_pedido == factura.id_pedido).first()
    if pedido.id_usuario != int(usuario_actual["sub"]):
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta factura")

    ruta_pdf = f"factura_{factura.numero_factura}.pdf"
    c = canvas.Canvas(ruta_pdf)
    c.drawString(100, 800, f"Factura: {factura.numero_factura}")
    c.drawString(100, 780, f"Cliente: {factura.nombre_facturacion}")
    c.drawString(100, 760, f"Total: Q{factura.total}")
    c.save()

    return FileResponse(ruta_pdf, media_type="application/pdf", filename=ruta_pdf)

@app.get("/facturas/mis-facturas", response_model=list[FacturaOut])
def mis_facturas(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    id_usuario = int(usuario_actual["sub"])
    facturas = db.query(models.Factura).join(models.Pedido).filter(
        models.Pedido.id_usuario == id_usuario
    ).all()
    return facturas

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