import { useEffect, useState } from 'react'
import { listarProductos, listarCategorias } from '../services/productos'
import CatalogoVista from '../components/CatalogoVista'

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [cargando, setCargando] = useState(true)

 useEffect(() => {
  Promise.all([
    listarProductos(),
    listarCategorias()
  ])
    .then(([datosProductos, datosCategorias]) => {
      setProductos(datosProductos)
      setCategorias(datosCategorias)
    })
    .catch(error => console.error('Error cargando datos:', error))
    .finally(() => setCargando(false))
}, [])

  const productosFiltrados = productos
    .filter(p => {
      const coincideCategoria = categoriaSeleccionada
        ? p.id_categoria === categoriaSeleccionada
        : true
      const coincideBusqueda = busqueda
        ? p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        : true
      return coincideCategoria && coincideBusqueda
    })
    .sort((a, b) => {
      switch (orden) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'precio-menor':
          return a.precio - b.precio
        case 'precio-mayor':
          return b.precio - a.precio
        case 'recientes':
        default:
          return b.id_producto - a.id_producto
      }
    })

  return (
    <CatalogoVista
      productos={productosFiltrados}
      categorias={categorias}
      categoriaSeleccionada={categoriaSeleccionada}
      busqueda={busqueda}
      orden={orden}
      cargando={cargando}
      onCategoriaChange={setCategoriaSeleccionada}
      onBusquedaChange={setBusqueda}
      onOrdenChange={setOrden}
    />
  )
}

export default Catalogo