from pydantic import BaseModel
from datetime import datetime


class ProductoOut(BaseModel):
    id_producto: int
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int
    id_categoria: int
    estado: str

    class Config:
        from_attributes = True


class UsuarioCreate(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    telefono: str | None = None


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    correo: str
    telefono: str | None = None
    estado: str

    class Config:
        from_attributes = True

class DetallePedidoCreate(BaseModel):
    id_producto: int
    cantidad: int


class PedidoCreate(BaseModel):
    id_direccion: int
    id_metodo_pago: int
    productos: list[DetallePedidoCreate]


class PedidoOut(BaseModel):
    id_pedido: int
    id_usuario: int
    id_direccion: int
    estado_actual: str
    numero_factura: str | None = None
    total_factura: float | None = None

    class Config:
        from_attributes = True


class EstadoUpdate(BaseModel):
    estado_actual: str

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

class DireccionCreate(BaseModel):
    departamento: str
    municipio: str
    direccion_exacta: str
    telefono_contacto: str
    nota: str | None = None

class DireccionOut(BaseModel):
    id_direccion: int
    id_usuario: int
    departamento: str
    municipio: str
    direccion_exacta: str
    telefono_contacto: str
    nota: str | None = None

class Config:
        from_attributes = True

class CatalogoOut(BaseModel):
    id_catalogo: int
    tipo: str
    nombre: str
    id_padre: int | None = None

    class Config:
        from_attributes = True

class FacturaCreate(BaseModel):
    id_pedido: int
    id_metodo_pago: int
    nit_cliente: str | None = "CF"
    nombre_facturacion: str
    subtotal: float
    iva: float
    total: float

class FacturaOut(BaseModel):
    id_factura: int
    numero_factura: str
    id_pedido: int
    total: float
    estado: str

    class Config:
        from_attributes = True

class HistorialOut(BaseModel):
    id_historial: int
    id_pedido: int
    estado: str
    fecha_hora: datetime
    foto_entrega: str | None = None

    class Config:
        from_attributes = True
