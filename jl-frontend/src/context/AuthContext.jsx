import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  const iniciarSesion = (datosUsuario, tokenAcceso) => {
    setUsuario(datosUsuario)
    setToken(tokenAcceso)
  }

  const cerrarSesion = () => {
    setUsuario(null)
    setToken(null)
  }

  const estaLogueado = usuario !== null

  return (
    <AuthContext.Provider value={{ usuario, token, iniciarSesion, cerrarSesion, estaLogueado }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)