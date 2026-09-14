import api from './api'

export const listarDirecciones = async (id_usuario) => {
  const respuesta = await api.get(`/direcciones/${id_usuario}`)
  return respuesta.data
}

export const crearDireccion = async (datos) => {
  const respuesta = await api.post('/direcciones', datos)
  return respuesta.data
}