import { useNotificacion } from '../context/NotificacionContext'

function Notificacion() {
  const { notificacion, confirmacion } = useNotificacion()

  const estilos = {
    exito: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800'
  }

  return (
    <>
      {notificacion && (
        <div className={`fixed top-4 right-4 z-50 border-l-4 p-4 rounded-lg shadow-lg max-w-sm ${estilos[notificacion.tipo] || estilos.info}`}>
          <p className="font-semibold">{notificacion.mensaje}</p>
        </div>
      )}

      {confirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <p className="text-gray-800 mb-6">{confirmacion.mensaje}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmacion.onCancelar}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmacion.onConfirmar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Notificacion