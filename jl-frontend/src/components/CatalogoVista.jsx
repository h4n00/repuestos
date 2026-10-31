import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import SkeletonProducto from './SkeletonProducto'
import CarruselDestacados from './CarruselDestacados'

function CatalogoVista({ productos, categorias, categoriaSeleccionada, busqueda, orden, cargando, onCategoriaChange, onBusquedaChange, onOrdenChange }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

     {/* Banner con carrusel integrado */}
<section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
  <div className="max-w-6xl mx-auto px-4 py-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Repuestos de calidad para tu moto</h1>
        <p className="text-lg opacity-90">
          Encuentra los mejores repuestos y accesorios al mejor precio, con entrega en toda Guatemala
        </p>
      </div>
      <div>
        <CarruselDestacados />
      </div>
    </div>
  </div>
</section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Productos</h2>

{/* Búsqueda, filtro y ordenamiento */}
<div className="mb-6 flex flex-col md:flex-row gap-3">
  <input
    type="text"
    value={busqueda}
    onChange={e => onBusquedaChange(e.target.value)}
    placeholder="🔍 Buscar producto..."
    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
  <select
    value={categoriaSeleccionada || ''}
    onChange={e => onCategoriaChange(e.target.value ? Number(e.target.value) : null)}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
  >
    <option value="">Todas las categorías</option>
    {categorias.map(cat => (
      <option key={cat.id_catalogo} value={cat.id_catalogo}>{cat.nombre}</option>
    ))}
  </select>
  <select
    value={orden}
    onChange={e => onOrdenChange(e.target.value)}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
  >
    <option value="recientes">Más recientes</option>
    <option value="nombre">Nombre (A-Z)</option>
    <option value="precio-menor">Precio: menor a mayor</option>
    <option value="precio-mayor">Precio: mayor a menor</option>
  </select>
</div>

{cargando ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <SkeletonProducto key={i} />
    ))}
  </div>
) : productos.length === 0 ? (
  <p className="text-center py-12 text-gray-500">No hay productos en esta categoría.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map(producto => {
              const sinStock = producto.stock === 0

              if (sinStock) {
                return (
                  <div
  key={producto.id_producto}
  className="bg-white rounded-lg shadow p-4 flex flex-col opacity-60 cursor-not-allowed fade-in-up"
  style={{ animationDelay: `${(productos.indexOf(producto)) * 0.05}s` }}
>
                    <div className="relative">
                      {producto.imagen_url ? (
                        <img
                          src={`http://127.0.0.1:8000/imagenes/${producto.imagen_url}`}
                          alt={producto.nombre}
                          className="h-40 w-full object-contain bg-gray-100 rounded mb-3"
                        />
                      ) : (
                        <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-sm">
                          Sin imagen
                        </div>
                      )}
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        AGOTADO
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{producto.nombre}</h3>
                    <p className="text-orange-600 font-bold text-lg mt-auto">
  Q{producto.precio} </p>
                  </div>
                )
              }

              return (
                <Link
  key={producto.id_producto}
  to={`/producto/${producto.id_producto}`}
  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col fade-in-up"
  style={{ animationDelay: `${(productos.indexOf(producto)) * 0.05}s` }}
>
                  {producto.imagen_url ? (
                    <img
                      src={`http://127.0.0.1:8000/imagenes/${producto.imagen_url}`}
                      alt={producto.nombre}
                      className="h-40 w-full object-contain bg-gray-100 rounded mb-3"
                    />
                  ) : (
                    <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-800 mb-2">{producto.nombre}</h3>
                  <p className="text-orange-600 font-bold text-lg mt-auto">
  Q{producto.precio} </p>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CatalogoVista