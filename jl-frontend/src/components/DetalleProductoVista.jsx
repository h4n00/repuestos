import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'

function DetalleProductoVista({ producto }) {
  const { agregarItem } = useCarrito()

  if (!producto) return <p>Cargando...</p>

  const handleAgregar = () => {
    agregarItem(producto)
    alert(`${producto.nombre} agregado al carrito`)
  }

  return (
    <div>
      <Link to="/">← Volver al catálogo</Link>
      <h1>{producto.nombre}</h1>
      <p>{producto.descripcion}</p>
      <p><strong>Precio:</strong> Q{producto.precio}</p>
      <p><strong>Stock disponible:</strong> {producto.stock}</p>
      <button onClick={handleAgregar}>Agregar al carrito</button>
    </div>
  )
}

export default DetalleProductoVista