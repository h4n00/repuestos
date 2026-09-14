import { Link } from 'react-router-dom'
import BarraProgreso from './BarraProgreso'
import { calcularPasoActual } from '../utils/tracking'
import Header from './Header'
import Footer from './Footer'

function MisPedidosVista({ pedidos, cargando, onDescargarFactura }) {
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <p className="text-center py-8 text-gray-600">Cargando pedidos...</p>
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center w-full">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">No tienes pedidos aún</h1>
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

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Pedidos</h1>

        <div className="space-y-4">
          {pedidos.map(pedido => (
            <div key={pedido.id_pedido} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Pedido #{pedido.id_pedido}</h3>
                  <p className="text-sm text-gray-500">{new Date(pedido.fecha_pedido).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-semibold text-gray-800">{pedido.estado_actual}</p>
                </div>
              </div>

              <BarraProgreso pasoActual={calcularPasoActual(pedido.estado_actual)} />

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Productos:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pedido.productos.map((p, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{p.nombre} × {p.cantidad}</span>
                      <span className="font-semibold">Q{p.subtotal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-lg font-bold text-orange-600">Total: Q{pedido.total}</p>
                {pedido.id_factura && (
                  <button
                    onClick={() => onDescargarFactura(pedido.id_factura)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
                  >
                    Descargar Factura
                  </button>
                )}
              </div>

              {pedido.numero_factura && (
                <p className="text-xs text-gray-500 mt-2">Factura: {pedido.numero_factura}</p>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MisPedidosVista