import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  // Al cargar la app, recupera el token guardado (si existe)
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  const iniciarSesion = (datosUsuario, tokenAcceso) => {
    setUsuario(datosUsuario)
    setToken(tokenAcceso)
    localStorage.setItem('token', tokenAcceso)
    localStorage.setItem('usuario', JSON.stringify(datosUsuario))
  }

  const cerrarSesion = () => {
    setUsuario(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  const estaLogueado = usuario !== null

  return (
    <AuthContext.Provider value={{ usuario, token, iniciarSesion, cerrarSesion, estaLogueado }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)