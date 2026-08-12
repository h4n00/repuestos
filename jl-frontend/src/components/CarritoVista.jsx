import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'

function CarritoVista() {
  const { items, eliminarItem, vaciarCarrito, aumentarCantidad, disminuirCantidad, totalItems, totalPrecio } = useCarrito()

  if (items.length === 0) {
    return (
      <div>
        <Link to="/">← Volver al catálogo</Link>
        <h1>Tu carrito está vacío</h1>
      </div>
    )
  }

  return (
    <div>
      <Link to="/">← Volver al catálogo</Link>
      <h1>Mi Carrito</h1>
      <ul>
        {items.map(item => (
          <li key={item.id_producto}>
            {item.nombre} — Q{item.precio} ×
            <button onClick={() => disminuirCantidad(item.id_producto)}>−</button>
            {item.cantidad}
            <button onClick={() => aumentarCantidad(item.id_producto)}>+</button>
            = Q{item.precio * item.cantidad}
            <button onClick={() => eliminarItem(item.id_producto)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <p><strong>Total de items:</strong> {totalItems}</p>
      <p><strong>Total a pagar:</strong> Q{totalPrecio}</p>
      <button onClick={vaciarCarrito}>Vaciar carrito</button>
      <button>Confirmar compra</button>
    </div>
  )
}

export default CarritoVista