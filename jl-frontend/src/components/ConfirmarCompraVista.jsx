import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { PayPalButtons } from '@paypal/react-paypal-js'

function ConfirmarCompraVista({ items, totalPrecio, iva, totalConIva, direcciones, idDireccion, idMetodoPago, error, cargando, onDireccionChange, onMetodoPagoChange, onCrearOrden, onAprobarPago, onErrorPago, onCancelarPago, onConfirmarEfectivo }) {
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center w-full">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">No hay productos para confirmar</h1>
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
        <Link to="/carrito" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver al carrito
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Confirmar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: datos */}
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow p-6">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-lg font-semibold text-gray-800">Dirección de entrega</h2>
    <Link
      to="/direcciones/nueva"
      className="text-sm text-orange-600 hover:underline font-semibold"
    >
      + Agregar otra
    </Link>
  </div>

  {direcciones.length === 0 ? (
    <p className="text-gray-600">
      No tienes direcciones guardadas.{' '}
      <Link to="/direcciones/nueva" className="text-orange-600 hover:underline">
        Agregar una
      </Link>
    </p>
  ) : (
    <select
      value={idDireccion}
      onChange={e => onDireccionChange(Number(e.target.value))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="">-- Selecciona una dirección --</option>
      {direcciones.map(d => (
        <option key={d.id_direccion} value={d.id_direccion}>
          {d.direccion_exacta}, {d.municipio}, {d.departamento}
        </option>
      ))}
    </select>
  )}
</div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Método de pago</h2>
              <select
                value={idMetodoPago}
                onChange={e => onMetodoPagoChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Selecciona --</option>
                <option value={1}>Efectivo</option>
                <option value={2}>Tarjeta/PayPal</option>
              </select>
            </div>
          </div>

          {/* Columna derecha: resumen */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen</h2>
            <ul className="space-y-2 mb-4">
              {items.map(item => (
                <li key={item.id_producto} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.nombre} × {item.cantidad}</span>
                  <span className="font-semibold">Q{item.precio * item.cantidad}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 space-y-1">
  <div className="flex justify-between text-sm text-gray-600">
    <span>Subtotal:</span>
    <span>Q{totalPrecio.toFixed(2)}</span>
  </div>
 
  <div className="flex justify-between items-center pt-2">
    <span className="font-semibold">Total:</span>
    <span className="text-2xl font-bold text-orange-600">Q{totalConIva.toFixed(2)}</span>
  </div>
</div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded mt-4">{error}</p>
            )}

  <div className="mt-4">
  {!idDireccion || !idMetodoPago ? (
    <p className="text-sm text-gray-500 text-center py-3 bg-gray-50 rounded-lg">
      Selecciona una dirección y método de pago para continuar
    </p>
  ) : idMetodoPago === 1 ? (
    <button
      onClick={onConfirmarEfectivo}
      disabled={cargando}
      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
    >
      {cargando ? 'Procesando...' : 'Confirmar compra'}
    </button>
  ) : (
    <PayPalButtons
      style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
      createOrder={onCrearOrden}
      onApprove={onAprobarPago}
      onError={onErrorPago}
      onCancel={onCancelarPago}
    />
  )}
</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ConfirmarCompraVista