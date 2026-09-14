import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const DEPARTAMENTOS_GT = [
  'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso',
  'Escuintla', 'Guatemala', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa',
  'Petén', 'Quetzaltenango', 'Quiché', 'Retalhuleu', 'Sacatepéquez',
  'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez', 'Totonicapán', 'Zacapa'
]

function AgregarDireccionVista({ departamento, municipio, direccionExacta, telefono, nota, error, cargando, onDepartamentoChange, onMunicipioChange, onDireccionChange, onTelefonoChange, onNotaChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <Link to="/confirmar" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Agregar Dirección</h1>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select
                  value={departamento}
                  onChange={e => onDepartamentoChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Selecciona --</option>
                  {DEPARTAMENTOS_GT.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input
                  type="text"
                  value={municipio}
                  onChange={e => onMunicipioChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección exacta</label>
              <input
                type="text"
                value={direccionExacta}
                onChange={e => onDireccionChange(e.target.value)}
                required
                placeholder="Ej: 5a calle 12-34, Zona 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto para esta entrega</label>
              <input
                type="text"
                value={telefono}
                onChange={e => onTelefonoChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
              <input
                type="text"
                value={nota}
                onChange={e => onNotaChange(e.target.value)}
                placeholder="Ej: Casa color blanco, portón negro"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar dirección'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AgregarDireccionVista