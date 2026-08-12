import api from './api'

export const login = async (correo, contrasena) => {
  const respuesta = await api.post('/login', { correo, contrasena })
  return respuesta.data
}

export const registrarUsuario = async (datos) => {
  const respuesta = await api.post('/usuarios', datos)
  return respuesta.data
}