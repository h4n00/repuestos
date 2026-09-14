import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { misPedidos } from '../services/pedidos'
import api from '../services/api'
import MisPedidosVista from '../components/MisPedidosVista'

function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const { estaLogueado } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!estaLogueado) {
      navigate('/login')
      return
    }
    misPedidos()
      .then(datos => setPedidos(datos))
      .catch(err => console.error('Error cargando pedidos:', err))
      .finally(() => setCargando(false))
  }, [estaLogueado, navigate])

  const handleDescargarFactura = async (idFactura) => {
    try {
      const respuesta = await api.get(`/facturas/${idFactura}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([respuesta.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `factura_${idFactura}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error descargando factura:', err)
    }
  }

  return <MisPedidosVista pedidos={pedidos} cargando={cargando} onDescargarFactura={handleDescargarFactura} />
}

export default MisPedidos