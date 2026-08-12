import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerProducto } from '../services/productos'
import DetalleProductoVista from '../components/DetalleProductoVista'

function DetalleProducto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)

  useEffect(() => {
    obtenerProducto(id)
      .then(datos => setProducto(datos))
      .catch(error => console.error('Error cargando producto:', error))
  }, [id])

  return <DetalleProductoVista producto={producto} />
}

export default DetalleProducto