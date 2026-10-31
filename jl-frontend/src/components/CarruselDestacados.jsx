import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productosDestacados } from '../services/productos'

function CarruselDestacados() {
  const [productos, setProductos] = useState([])
  const [indiceActual, setIndiceActual] = useState(0)

  useEffect(() => {
    productosDestacados()
      .then(datos => setProductos(datos))
      .catch(err => console.error('Error cargando destacados:', err))
  }, [])

  useEffect(() => {
    if (productos.length === 0) return

    const intervalo = setInterval(() => {
      setIndiceActual(actual => (actual + 1) % productos.length)
    }, 4000)

    return () => clearInterval(intervalo)
  }, [productos])

  const irAnterior = () => {
    setIndiceActual(actual => (actual - 1 + productos.length) % productos.length)
  }

  const irSiguiente = () => {
    setIndiceActual(actual => (actual + 1) % productos.length)
  }

  if (productos.length === 0) return null

  const productoActual = productos[indiceActual]

  return (
    <div className="relative">
      <Link
        to={`/producto/${productoActual.id_producto}`}
        className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {productoActual.imagen_url ? (
            <img
              src={`http://127.0.0.1:8000/imagenes/${productoActual.imagen_url}`}
              alt={productoActual.nombre}
              className="h-40 w-full object-contain"
            />
          ) : (
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}

          <div>
            <span className="inline-block bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              DESTACADO
            </span>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{productoActual.nombre}</h3>
            <p className="text-2xl font-bold text-orange-600 mb-1">Q{productoActual.precio}</p>
            <p className="text-xs text-orange-700 font-semibold">Ver detalles →</p>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); irAnterior() }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md hover:bg-gray-100 transition font-bold text-gray-700 text-sm"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.preventDefault(); irSiguiente() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md hover:bg-gray-100 transition font-bold text-gray-700 text-sm"
      >
        ›
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {productos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndiceActual(idx)}
            className={`h-2 rounded-full transition ${
              idx === indiceActual ? 'bg-white w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default CarruselDestacados