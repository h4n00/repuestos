import { createContext, useContext, useState } from 'react'

const NotificacionContext = createContext()

export function NotificacionProvider({ children }) {
  const [notificacion, setNotificacion] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ mensaje, tipo })
    setTimeout(() => setNotificacion(null), 3500)
  }

  const confirmar = (mensaje) => {
    return new Promise((resolve) => {
      setConfirmacion({
        mensaje,
        onConfirmar: () => {
          setConfirmacion(null)
          resolve(true)
        },
        onCancelar: () => {
          setConfirmacion(null)
          resolve(false)
        }
      })
    })
  }

  return (
    <NotificacionContext.Provider value={{ notificacion, confirmacion, mostrarNotificacion, confirmar }}>
      {children}
    </NotificacionContext.Provider>
  )
}

export const useNotificacion = () => useContext(NotificacionContext)