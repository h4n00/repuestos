import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'

function CatalogoVista({ productos }) {
  const { totalItems } = useCarrito()
  const { usuario, cerrarSesion } = useAuth()

  return (
    <div>
      <div>
        {usuario ? (
          <>
            <span>Hola, {usuario.nombre}</span>
            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
        <Link to="/carrito">🛒 Carrito ({totalItems})</Link>
      </div>
      <h1>Catálogo de Productos</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id_producto}>
            <Link to={`/producto/${producto.id_producto}`}>
              {producto.nombre} — Q{producto.precio}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CatalogoVista