import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import Header from './Header'
import Footer from './Footer'

function CarritoVista() {
  const { items, eliminarItem, vaciarCarrito, aumentarCantidad, disminuirCantidad, totalItems, totalPrecio, iva, totalConIva } = useCarrito()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center w-full">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h1>
          <Link
            to="/"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
          >
            Ir al catálogo
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Link to="/" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver al catálogo
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Carrito</h1>

        <div className="bg-white rounded-lg shadow divide-y">
          {items.map(item => (
            <div key={item.id_producto} className="p-4 flex items-center gap-4">
              {item.imagen_url && (
                <img
                  src={`http://127.0.0.1:8000/imagenes/${item.imagen_url}`}
                  alt={item.nombre}
                  className="w-20 h-20 object-contain bg-gray-100 rounded"
                />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                <p className="text-sm text-gray-500">Q{item.precio} c/u</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => disminuirCantidad(item.id_producto)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
               <button
  onClick={() => aumentarCantidad(item.id_producto)}
  disabled={item.cantidad >= item.stock}
  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
>
  +
</button>
              </div>

              <div className="w-24 text-right font-bold text-orange-600">
                Q{item.precio * item.cantidad}
              </div>

              <button
                onClick={() => eliminarItem(item.id_producto)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mt-4 flex justify-between items-center">
         <div>
  <p className="text-sm text-gray-500">Total de items: {totalItems}</p>
  <p className="text-sm text-gray-600">Subtotal: Q{totalPrecio.toFixed(2)}</p>
  <p className="text-sm text-gray-600">IVA (12%): Q{iva.toFixed(2)}</p>
  <p className="text-2xl font-bold text-orange-600">Total: Q{totalConIva.toFixed(2)}</p>
</div>

          <div className="flex gap-2">
            <button
              onClick={vaciarCarrito}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Vaciar carrito
            </button>
            <Link
              to="/confirmar"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Confirmar compra
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CarritoVista