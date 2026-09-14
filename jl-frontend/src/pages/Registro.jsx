import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarUsuario, login } from '../services/usuarios'
import { useAuth } from '../context/AuthContext'
import RegistroVista from '../components/RegistroVista'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await registrarUsuario({ nombre, correo, contrasena, telefono })
      // Después de registrar, iniciar sesión automáticamente
      const datos = await login(correo, contrasena)
      iniciarSesion(
        { id_usuario: datos.id_usuario, nombre: datos.nombre },
        datos.access_token
      )
      navigate('/')
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al crear la cuenta'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <RegistroVista
      nombre={nombre}
      correo={correo}
      contrasena={contrasena}
      telefono={telefono}
      error={error}
      cargando={cargando}
      onNombreChange={setNombre}
      onCorreoChange={setCorreo}
      onContrasenaChange={setContrasena}
      onTelefonoChange={setTelefono}
      onSubmit={handleSubmit}
    />
  )
}

export default Registro