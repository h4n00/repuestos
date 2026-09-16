import { useState } from 'react'
import { descargarReporteVentas } from '../services/adminProductos'
import { useNotificacion } from '../context/NotificacionContext'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function ReporteVentas() {
  const anioActual = new Date().getFullYear()
  const [anio, setAnio] = useState(anioActual)
  const [mes, setMes] = useState('')
  const [descargando, setDescargando] = useState(false)
  const { mostrarNotificacion } = useNotificacion()

  const handleDescargar = async () => {
    setDescargando(true)
    try {
      await descargarReporteVentas(anio, mes ? Number(mes) : null)
      mostrarNotificacion('Reporte descargado correctamente', 'exito')
    } catch (err) {
      mostrarNotificacion('Error al generar el reporte', 'error')
      console.error(err)
    } finally {
      setDescargando(false)
    }
  }

  // Últimos 5 años para el selector
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3, anioActual - 4]

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Reporte de Ventas</h2>
      <p className="text-sm text-gray-600 mb-4">
        Descarga el reporte de facturación en formato Excel, filtrado por año y opcionalmente por mes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            value={anio}
            onChange={e => setAnio(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {anios.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes (opcional)</label>
          <select
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todo el año</option>
            {MESES.map((nombre, idx) => (
              <option key={idx} value={idx + 1}>{nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-semibold"
          >
            {descargando ? 'Generando...' : '⬇ Descargar Excel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReporteVentas