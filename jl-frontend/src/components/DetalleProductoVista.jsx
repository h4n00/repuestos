import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useNotificacion } from '../context/NotificacionContext'
import Header from './Header'
import Footer from './Footer'
import ResenasProducto from './ResenasProducto'

function DetalleProductoVista({ producto }) {
  const { agregarItem } = useCarrito()
  const { mostrarNotificacion } = useNotificacion()

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <p className="text-center py-8 text-gray-600">Cargando...</p>
      </div>
    )
  }

  const sinStock = producto.stock === 0

  const handleAgregar = () => {
    agregarItem(producto)
    mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'exito')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Link to="/" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver al catálogo
        </Link>

       <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {producto.imagen_url ? (
  <img
    src={`http://127.0.0.1:8000/imagenes/${producto.imagen_url}`}
    alt={producto.nombre}
    className="w-full aspect-square object-contain bg-gray-100 rounded"
  />
) : (
  <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
    Sin imagen
  </div>
)}

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{producto.nombre}</h1>
            <p className="text-gray-600 mb-6">{producto.descripcion}</p>

            <p className="text-4xl font-bold text-orange-600 mb-1">Q{producto.precio}</p>
<p className="text-sm text-gray-500 mb-4">Precio con IVA incluido</p>

            {sinStock ? (
  <p className="text-sm text-red-600 font-semibold mb-6 flex items-center gap-1">
    ✗ Sin stock disponible
  </p>
) : (
  <p className="text-sm text-green-600 font-semibold mb-6 flex items-center gap-1">
    ✓ Disponible ({producto.stock} en existencia)
  </p>
)}

            {producto.compatibilidad && producto.compatibilidad.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Compatible con:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {producto.compatibilidad.map((c, idx) => (
                    <li key={idx}>• {c.marca} {c.modelo}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleAgregar}
              disabled={sinStock}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
            >
              {sinStock ? 'Sin stock disponible' : 'Agregar al carrito'}
            </button>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="flex items-start gap-3">
      <span className="text-2xl">💵</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Pago contra entrega</p>
        <p className="text-xs text-gray-500">Paga en efectivo al recibir</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-2xl">🚚</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Envío a toda Guatemala</p>
        <p className="text-xs text-gray-500">Entrega en todo el país</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-2xl">📄</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Factura en PDF</p>
        <p className="text-xs text-gray-500">La descargas desde tu pedido</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-2xl">📦</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">Rastreo del envío</p>
        <p className="text-xs text-gray-500">Sigue el estado de tu pedido</p>
      </div>
    </div>
  </div>
</div>
          </div>
          


        </div>
        <ResenasProducto idProducto={producto.id_producto} />
      </main>
      <Footer />
    </div>
  )
}

export default DetalleProductoVista