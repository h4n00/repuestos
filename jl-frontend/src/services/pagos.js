import api from './api'

export const crearOrdenPaypal = async (productos) => {
  const respuesta = await api.post('/pagos/crear-orden', { productos })
  return respuesta.data
}

export const capturarPago = async (datos) => {
  const respuesta = await api.post('/pagos/capturar', datos)
  return respuesta.data
}