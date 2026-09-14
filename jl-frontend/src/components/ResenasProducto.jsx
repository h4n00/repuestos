import { useEffect, useState } from 'react'
import { listarResenas, crearOActualizarResena, puedeResenar } from '../services/resenas'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import Estrellas from './Estrellas'

function ResenasProducto({ idProducto }) {
  const [resenas, setResenas] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [promedio, setPromedio] = useState(0)

  const [permisos, setPermisos] = useState({ puede_resenar: false, ya_reseno: false, mi_resena: null })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')

  const { estaLogueado } = useAuth()
  const { mostrarNotificacion } = useNotificacion()

  const cargarResenas = async (p = 1) => {
    try {
      const datos = await listarResenas(idProducto, p)
      setResenas(datos.resenas)
      setTotal(datos.total)
      setTotalPaginas(datos.total_paginas)
      setPromedio(datos.promedio)
      setPagina(datos.pagina)
    } catch (err) {
      console.error('Error cargando reseñas:', err)
    }
  }

  const cargarPermisos = async () => {
    if (!estaLogueado) return
    try {
      const datos = await puedeResenar(idProducto)
      setPermisos(datos)
      if (datos.mi_resena) {
        setCalificacion(datos.mi_resena.calificacion)
        setComentario(datos.mi_resena.comentario || '')
      }
    } catch (err) {
      console.error('Error verificando permisos:', err)
    }
  }

  useEffect(() => {
    cargarResenas(1)
    cargarPermisos()
  }, [idProducto, estaLogueado])

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (calificacion < 1) {
      mostrarNotificacion('Debes seleccionar una calificación', 'error')
      return
    }
    try {
      await crearOActualizarResena({
        id_producto: idProducto,
        calificacion,
        comentario: comentario || null
      })
      mostrarNotificacion(permisos.ya_reseno ? 'Reseña actualizada' : 'Reseña enviada', 'exito')
      setMostrarFormulario(false)
      cargarResenas(1)
      cargarPermisos()
    } catch (err) {
      mostrarNotificacion(err.response?.data?.detail || 'Error al enviar reseña', 'error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Opiniones de clientes</h2>
          {total > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <Estrellas valor={Math.round(promedio)} soloLectura tamano="sm" />
              <span className="text-gray-700 font-semibold">{promedio.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({total} {total === 1 ? 'reseña' : 'reseñas'})</span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">Aún no hay reseñas</p>
          )}
        </div>

        {estaLogueado && permisos.puede_resenar && !mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
          >
            {permisos.ya_reseno ? 'Editar mi reseña' : 'Dejar reseña'}
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleEnviar} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tu calificación:</label>
          <Estrellas valor={calificacion} onCambio={setCalificacion} tamano="lg" />

          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Tu comentario (opcional):</label>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
              {permisos.ya_reseno ? 'Guardar cambios' : 'Enviar reseña'}
            </button>
            <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {resenas.length > 0 && (
        <>
          <div className="space-y-4">
            {resenas.map(r => (
              <div key={r.id_resena} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{r.nombre_usuario}</span>
                    <Estrellas valor={r.calificacion} soloLectura tamano="sm" />
                  </div>
                  <span className="text-xs text-gray-500">{new Date(r.fecha).toLocaleDateString()}</span>
                </div>
                {r.comentario && <p className="text-gray-700 text-sm mt-1">{r.comentario}</p>}
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button onClick={() => cargarResenas(pagina - 1)} disabled={pagina === 1} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {pagina} de {totalPaginas}</span>
              <button onClick={() => cargarResenas(pagina + 1)} disabled={pagina === totalPaginas} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ResenasProducto