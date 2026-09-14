import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { totalItems } = useCarrito()
  const { usuario, cerrarSesion } = useAuth()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <img src="/logo-jl.png" alt="JL Repuestos" className="h-12" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/nosotros" className="text-gray-700 hover:text-orange-600">Nosotros</Link>
          {usuario ? (
            <>
              <span className="text-gray-700">Hola, <strong>{usuario.nombre}</strong></span>
              <Link to="/mis-pedidos" className="text-gray-700 hover:text-orange-600">Mis pedidos</Link>
              {usuario.rol === 'Admin' && (
                <Link to="/admin/pedidos" className="text-gray-700 hover:text-orange-600">Panel Admin</Link>
              )}
              <button
                onClick={cerrarSesion}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-orange-600">Iniciar sesión</Link>
          )}
          <Link
            to="/carrito"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            🛒 Carrito ({totalItems})
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header