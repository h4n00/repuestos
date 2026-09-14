import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import { todosLosPedidos, actualizarEstadoPedido } from '../services/pedidos'
import { stockBajo, estadisticasDashboard } from '../services/adminProductos'
import AdminPedidosVista from '../components/AdminPedidosVista'

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const { estaLogueado } = useAuth()
  const { mostrarNotificacion } = useNotificacion()
  const navigate = useNavigate()

  const cargarDatos = () => {
    todosLosPedidos()
      .then(datos => setPedidos(datos))
      .catch(err => console.error('Error cargando pedidos:', err))

    stockBajo()
      .then(datos => setProductosStockBajo(datos))
      .catch(err => console.error('Error cargando stock bajo:', err))

    estadisticasDashboard()
      .then(datos => setEstadisticas(datos))
      .catch(err => console.error('Error cargando estadísticas:', err))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    if (!estaLogueado) {
      navigate('/login')
      return
    }
    cargarDatos()
  }, [estaLogueado, navigate])

  const handleCambiarEstado = async (idPedido, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(idPedido, nuevoEstado)
      mostrarNotificacion(`Pedido #${idPedido} actualizado a "${nuevoEstado}"`, 'exito')
      cargarDatos()
    } catch (err) {
      mostrarNotificacion('Error al cambiar el estado', 'error')
      console.error(err)
    }
  }

  return (
    <AdminPedidosVista
      pedidos={pedidos}
      productosStockBajo={productosStockBajo}
      estadisticas={estadisticas}
      cargando={cargando}
      onCambiarEstado={handleCambiarEstado}
    />
  )
}

export default AdminPedidos