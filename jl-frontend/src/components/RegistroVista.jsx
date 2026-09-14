import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function RegistroVista({ nombre, correo, contrasena, telefono, error, cargando, onNombreChange, onCorreoChange, onContrasenaChange, onTelefonoChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crear Cuenta</h1>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => onNombreChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={e => onCorreoChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={e => onContrasenaChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono personal</label>
              <input
                type="text"
                value={telefono}
                onChange={e => onTelefonoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
            >
              {cargando ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default RegistroVista