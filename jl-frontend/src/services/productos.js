import api from './api'

export const listarProductos = async () => {
  const respuesta = await api.get('/productos')
  return respuesta.data
}

export const obtenerProducto = async (id) => {
  const respuesta = await api.get(`/productos/${id}`)
  return respuesta.data
}