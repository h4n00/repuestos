import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/usuarios'
import { useAuth } from '../context/AuthContext'
import LoginVista from '../components/LoginVista'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const datos = await login(correo, contrasena)
      if (datos.error) {
        setError(datos.error)
        return
      }
      iniciarSesion(
        { id_usuario: datos.id_usuario, nombre: datos.nombre },
        datos.access_token
      )
      navigate('/')
    } catch (err) {
      setError('Error al iniciar sesión')
      console.error(err)
    }
  }

  return (
    <LoginVista
      correo={correo}
      contrasena={contrasena}
      error={error}
      onCorreoChange={setCorreo}
      onContrasenaChange={setContrasena}
      onSubmit={handleSubmit}
    />
  )
}

export default Login