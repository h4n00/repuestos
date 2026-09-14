import api from './api'

export const crearOActualizarResena = async (datos) => {
  const respuesta = await api.post('/resenas', datos)
  return respuesta.data
}

export const listarResenas = async (idProducto, pagina = 1) => {
  const respuesta = await api.get(`/productos/${idProducto}/resenas?pagina=${pagina}`)
  return respuesta.data
}

export const puedeResenar = async (idProducto) => {
  const respuesta = await api.get(`/productos/${idProducto}/puede-resenar`)
  return respuesta.data
}