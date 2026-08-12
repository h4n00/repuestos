import { useEffect, useState } from 'react'
import { listarProductos } from '../services/productos'
import CatalogoVista from '../components/CatalogoVista'

function Catalogo() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    listarProductos()
      .then(datos => setProductos(datos))
      .catch(error => console.error('Error cargando productos:', error))
  }, [])

  return <CatalogoVista productos={productos} />
}

export default Catalogo