import api from './api'

export const listarProductos = async () => {
  const respuesta = await api.get('/productos')
  return respuesta.data
}

export const obtenerProducto = async (id) => {
  const respuesta = await api.get(`/productos/${id}`)
  return respuesta.data
}

export const listarCategorias = async () => {
  const respuesta = await api.get('/catalogo?tipo=Categoria')
  return respuesta.data
}

export const productosDestacados = async () => {
  const respuesta = await api.get('/productos/destacados')
  return respuesta.data
}