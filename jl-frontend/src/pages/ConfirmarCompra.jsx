import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import { listarDirecciones } from '../services/direcciones'
import { crearOrdenPaypal, capturarPago } from '../services/pagos'
import { crearPedido } from '../services/pedidos'
import ConfirmarCompraVista from '../components/ConfirmarCompraVista'

function ConfirmarCompra() {
  const { items, totalPrecio, iva, totalConIva, vaciarCarrito } = useCarrito()
  const { usuario, estaLogueado } = useAuth()
  const { mostrarNotificacion } = useNotificacion()
  const navigate = useNavigate()

  const [direcciones, setDirecciones] = useState([])
  const [idDireccion, setIdDireccion] = useState('')
  const [idMetodoPago, setIdMetodoPago] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!estaLogueado) {
      navigate('/login')
      return
    }
    listarDirecciones(usuario.id_usuario)
      .then(datos => setDirecciones(datos))
      .catch(err => console.error('Error cargando direcciones:', err))
  }, [estaLogueado, usuario, navigate])

  const handleCrearOrden = async () => {
    try {
      const datos = await crearOrdenPaypal(
        items.map(i => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad
        }))
      )
      return datos.id_orden_paypal
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la orden de pago')
      throw err
    }
  }

  const handleAprobarPago = async (data) => {
    try {
      const respuesta = await capturarPago({
        id_orden_paypal: data.orderID,
        id_direccion: idDireccion,
        id_metodo_pago: idMetodoPago,
        productos: items.map(i => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad
        }))
      })
      mostrarNotificacion(`Pago exitoso. Factura: ${respuesta.numero_factura} — Total: Q${respuesta.total_factura}`, 'exito')
      vaciarCarrito()
      navigate('/mis-pedidos')
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al procesar el pago'
      mostrarNotificacion(mensaje, 'error')
    }
  }

  const handleErrorPago = (err) => {
    console.error('Error de PayPal:', err)
    mostrarNotificacion('Ocurrió un error con PayPal. Intenta de nuevo.', 'error')
  }

  const handleCancelarPago = () => {
    mostrarNotificacion('Pago cancelado', 'info')
  }

  const handleConfirmarEfectivo = async () => {
    setCargando(true)
    try {
      const respuesta = await crearPedido({
        id_direccion: idDireccion,
        id_metodo_pago: idMetodoPago,
        productos: items.map(i => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad
        }))
      })
      mostrarNotificacion(`Compra realizada. Factura: ${respuesta.numero_factura} — Total: Q${respuesta.total_factura}`, 'exito')
      vaciarCarrito()
      navigate('/mis-pedidos')
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al crear el pedido'
      mostrarNotificacion(mensaje, 'error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <ConfirmarCompraVista
      items={items}
      totalPrecio={totalPrecio}
      iva={iva}
      totalConIva={totalConIva}
      direcciones={direcciones}
      idDireccion={idDireccion}
      idMetodoPago={idMetodoPago}
      error={error}
      cargando={cargando}
      onDireccionChange={setIdDireccion}
      onMetodoPagoChange={setIdMetodoPago}
      onCrearOrden={handleCrearOrden}
      onAprobarPago={handleAprobarPago}
      onErrorPago={handleErrorPago}
      onCancelarPago={handleCancelarPago}
      onConfirmarEfectivo={handleConfirmarEfectivo}
    />
  )
}

export default ConfirmarCompra