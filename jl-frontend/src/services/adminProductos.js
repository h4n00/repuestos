import api from './api'

export const crearProducto = async (datos) => {
  const respuesta = await api.post('/admin/productos', datos)
  return respuesta.data
}

export const actualizarProducto = async (idProducto, datos) => {
  const respuesta = await api.put(`/admin/productos/${idProducto}`, datos)
  return respuesta.data
}

export const eliminarProducto = async (idProducto) => {
  const respuesta = await api.delete(`/admin/productos/${idProducto}`)
  return respuesta.data
}

export const subirImagen = async (archivo, idProducto, nombreProducto, idCategoria) => {
  const formData = new FormData()
  formData.append('archivo', archivo)

  const respuesta = await api.post('/admin/subir-imagen', formData, {
    params: {
      id_producto: idProducto,
      nombre_producto: nombreProducto,
      id_categoria: idCategoria
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return respuesta.data
}

export const stockBajo = async () => {
  const respuesta = await api.get('/admin/stock-bajo')
  return respuesta.data
}

export const estadisticasDashboard = async () => {
  const respuesta = await api.get('/admin/estadisticas')
  return respuesta.data
}

export const descargarReporteVentas = async (anio, mes = null) => {
  const params = { anio }
  if (mes) params.mes = mes

  const respuesta = await api.get('/admin/reporte-ventas', {
    params,
    responseType: 'blob'
  })

  const blob = new Blob([respuesta.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = mes
    ? `reporte_ventas_${anio}_${String(mes).padStart(2, '0')}.xlsx`
    : `reporte_ventas_${anio}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}