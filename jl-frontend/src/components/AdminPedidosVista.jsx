import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function AdminPedidosVista({ pedidos, productosStockBajo, estadisticas, cargando, onCambiarEstado }) {
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <p className="text-center py-8 text-gray-600">Cargando pedidos...</p>
      </div>
    )
  }

  const estados = ['En preparación', 'En ruta', 'Entregado']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Link to="/" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver al catálogo
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administrador</h1>
          <Link to="/admin/productos" className="text-sm text-orange-600 hover:underline">
  Gestionar productos →
</Link>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
            {pedidos.length} pedidos
          </span>
        </div>

{estadisticas && (
  <div className="mb-6">
    <p className="text-sm text-gray-500 mb-3 capitalize">Resumen de {estadisticas.mes_actual}</p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <p className="text-sm text-gray-500">Ventas del mes</p>
        <p className="text-2xl font-bold text-green-600">Q{estadisticas.ventas_mes.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <p className="text-sm text-gray-500">Pedidos del mes</p>
        <p className="text-2xl font-bold text-blue-600">{estadisticas.pedidos_mes}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
        <p className="text-sm text-gray-500">Pedidos pendientes</p>
        <p className="text-2xl font-bold text-orange-600">{estadisticas.pedidos_pendientes}</p>
      </div>
    </div>

    {estadisticas.top_productos && estadisticas.top_productos.length > 0 && (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-2">🏆 Productos más vendidos</h3>
        <ol className="space-y-1">
          {estadisticas.top_productos.map((p, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">
                <strong>#{idx + 1}</strong> {p.nombre}
              </span>
              <span className="font-semibold text-gray-800">{p.cantidad} vendidos</span>
            </li>
          ))}
        </ol>
      </div>
    )}
  </div>
)}

        {productosStockBajo && productosStockBajo.length > 0 && (
  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-bold text-yellow-800 mb-2">
          ⚠️ {productosStockBajo.length} {productosStockBajo.length === 1 ? 'producto tiene' : 'productos tienen'} stock bajo
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          {productosStockBajo.map(p => (
            <li key={p.id_producto} className="flex justify-between">
              <span>{p.nombre}</span>
              <span className="font-semibold">Stock: {p.stock}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/admin/productos"
        className="text-sm text-yellow-800 hover:underline font-semibold ml-4"
      >
        Gestionar →
      </Link>
    </div>
  </div>
)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pedidos.map(pedido => (
            <div key={pedido.id_pedido} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">Pedido #{pedido.id_pedido}</h3>
                  <p className="text-sm text-gray-500">{new Date(pedido.fecha_pedido).toLocaleString()}</p>
                </div>

                {pedido.estado_actual === 'Entregado' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Entregado</span>
                )}
                {pedido.estado_actual === 'En ruta' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">En ruta</span>
                )}
                {pedido.estado_actual === 'En preparación' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En preparación</span>
                )}
                {(pedido.estado_actual !== 'Entregado' && pedido.estado_actual !== 'En ruta' && pedido.estado_actual !== 'En preparación') && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{pedido.estado_actual}</span>
                )}
              </div>

              <div className="mb-3 text-sm">
                <p className="text-gray-700"><strong>Cliente:</strong> {pedido.cliente}</p>
                <p className="text-gray-500 text-xs">{pedido.correo_cliente}</p>
              </div>

              {pedido.numero_factura && (
                <div className="mb-3 text-sm bg-gray-50 p-2 rounded">
                  <p className="text-gray-700"><strong>Factura:</strong> {pedido.numero_factura}</p>
                  <p className="text-orange-600 font-bold">Q{pedido.total}</p>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar estado:</label>
                <select
                  value={pedido.estado_actual}
                  onChange={e => onCambiarEstado(pedido.id_pedido, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="Pendiente" disabled>Pendiente</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminPedidosVista