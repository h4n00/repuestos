from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, Text
from sqlalchemy.sql import func
from database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    correo = Column(String(100), unique=True)
    contrasena = Column(String(255))
    telefono = Column(String(15))
    fecha_registro = Column(DateTime, server_default=func.now())
    estado = Column(String(20), default="Activo")
    rol = Column(String(20), default="Cliente")


class Catalogo(Base):
    __tablename__ = "catalogo"

    id_catalogo = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False)
    nombre = Column(String(50), nullable=False)
    id_padre = Column(Integer, nullable=True)


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(Text)
    precio = Column(DECIMAL(10, 2))
    stock = Column(Integer)
    id_categoria = Column(Integer, ForeignKey("catalogo.id_catalogo"))
    estado = Column(String(20), default="Disponible")


class Direccion_Entrega(Base):
    __tablename__ = "direccion_entrega"

    id_direccion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    departamento = Column(String(50))
    municipio = Column(String(50))
    direccion_exacta = Column(String(200))
    telefono_contacto = Column(String(15))
    nota = Column(String(255))


class Pedido(Base):
    __tablename__ = "pedido"

    id_pedido = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    id_direccion = Column(Integer, ForeignKey("direccion_entrega.id_direccion"))
    id_transportista = Column(Integer, nullable=True)
    fecha_pedido = Column(DateTime, server_default=func.now())
    estado_actual = Column(String(30))


class Detalle_Pedido(Base):
    __tablename__ = "detalle_pedido"

    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), primary_key=True)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), primary_key=True)
    cantidad = Column(Integer)
    precio_unitario = Column(DECIMAL(10, 2))

class Factura(Base):
    __tablename__ = "factura"

    id_factura = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"))
    id_metodo_pago = Column(Integer, ForeignKey("metodo_pago.id_metodo"))
    numero_factura = Column(String(20), unique=True)
    serie = Column(String(10))
    nit_cliente = Column(String(15))
    nombre_facturacion = Column(String(150))
    fecha_emision = Column(DateTime, server_default=func.now())
    subtotal = Column(DECIMAL(10, 2))
    iva = Column(DECIMAL(10, 2))
    total = Column(DECIMAL(10, 2))
    estado = Column(String(20))
    referencia_transaccion = Column(String(100), nullable=True)

class Metodo_Pago(Base):
    __tablename__ = "metodo_pago"

    id_metodo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(30))
    marca_tarjeta = Column(String(20), nullable=True)

class Historial_Estado_Pedido(Base):
    __tablename__ = "historial_estado_pedido"

    id_historial = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"))
    estado = Column(String(30))
    fecha_hora = Column(DateTime, server_default=func.now())
    foto_entrega = Column(String(255), nullable=True)