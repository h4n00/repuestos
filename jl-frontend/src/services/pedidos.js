import api from './api'

export const crearPedido = async (datos) => {
  const respuesta = await api.post('/pedidos', datos)
  return respuesta.data
}

export const misPedidos = async () => {
  const respuesta = await api.get('/pedidos/mis-pedidos')
  return respuesta.data
}

export const trackingPedido = async (idPedido) => {
  const respuesta = await api.get(`/pedidos/${idPedido}/tracking`)
  return respuesta.data
}

export const todosLosPedidos = async () => {
  const respuesta = await api.get('/pedidos/todos')
  return respuesta.data
}

export const actualizarEstadoPedido = async (idPedido, estado) => {
  const respuesta = await api.put(`/pedidos/${idPedido}/estado`, { estado_actual: estado })
  return respuesta.data
}