import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { crearDireccion } from '../services/direcciones'
import AgregarDireccionVista from '../components/AgregarDireccionVista'
import { useNotificacion } from '../context/NotificacionContext'

function AgregarDireccion() {
  const [departamento, setDepartamento] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [direccionExacta, setDireccionExacta] = useState('')
  const [telefono, setTelefono] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { mostrarNotificacion } = useNotificacion()

  const { estaLogueado } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!estaLogueado) {
      navigate('/login')
      return
    }

    setError('')
    setCargando(true)

    try {
      await crearDireccion({
        departamento,
        municipio,
        direccion_exacta: direccionExacta,
        telefono_contacto: telefono,
        nota: nota || null
      })
      mostrarNotificacion('Dirección agregada correctamente', 'exito')
      navigate('/confirmar')
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al agregar la dirección'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <AgregarDireccionVista
      departamento={departamento}
      municipio={municipio}
      direccionExacta={direccionExacta}
      telefono={telefono}
      nota={nota}
      error={error}
      cargando={cargando}
      onDepartamentoChange={setDepartamento}
      onMunicipioChange={setMunicipio}
      onDireccionChange={setDireccionExacta}
      onTelefonoChange={setTelefono}
      onNotaChange={setNota}
      onSubmit={handleSubmit}
    />
  )
}

export default AgregarDireccion