import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function AdminProductosVista({ productos, categorias, modelos, onCrear, onActualizar, onEliminar, cargando }) {
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_categoria: '',
    estado: 'Disponible',
    compatibilidad_ids: [],
    archivo: null
  })

  const abrirCrear = () => {
    setEditando(null)
    setFormulario({
      nombre: '', descripcion: '', precio: '', stock: '',
      id_categoria: '', estado: 'Disponible',
      compatibilidad_ids: [], archivo: null
    })
    setMostrarFormulario(true)
  }

  const abrirEditar = (producto) => {
    setEditando(producto.id_producto)
    setFormulario({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      stock: producto.stock || '',
      id_categoria: producto.id_categoria || '',
      estado: producto.estado || 'Disponible',
      compatibilidad_ids: [],
      archivo: null
    })
    setMostrarFormulario(true)
  }

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setEditando(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editando) {
      await onActualizar(editando, formulario)
    } else {
      await onCrear(formulario)
    }
    cerrarFormulario()
  }

  const toggleCompatibilidad = (idModelo) => {
    setFormulario(f => {
      const yaEsta = f.compatibilidad_ids.includes(idModelo)
      return {
        ...f,
        compatibilidad_ids: yaEsta
          ? f.compatibilidad_ids.filter(id => id !== idModelo)
          : [...f.compatibilidad_ids, idModelo]
      }
    })
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <p className="text-center py-8 text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Link to="/admin/pedidos" className="text-orange-600 hover:underline mb-4 inline-block">
          ← Volver al panel
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <button
            onClick={abrirCrear}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            + Nuevo producto
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editando ? `Editar Producto #${editando}` : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formulario.id_categoria}
                    onChange={e => setFormulario({ ...formulario, id_categoria: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Selecciona --</option>
                    {categorias.map(c => (
                      <option key={c.id_catalogo} value={c.id_catalogo}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulario.precio}
                    onChange={e => setFormulario({ ...formulario, precio: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={formulario.stock}
                    onChange={e => setFormulario({ ...formulario, stock: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={e => setFormulario({ ...formulario, descripcion: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formulario.estado}
                  onChange={e => setFormulario({ ...formulario, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Descontinuado">Descontinuado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen (JPG o PNG) {editando && <span className="text-gray-500 text-xs">(opcional, solo si quieres cambiarla)</span>}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={e => setFormulario({ ...formulario, archivo: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compatible con:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {modelos.map(m => (
                    <label key={m.id_catalogo} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formulario.compatibilidad_ids.includes(m.id_catalogo)}
                        onChange={() => toggleCompatibilidad(m.id_catalogo)}
                      />
                      {m.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                  {editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <button type="button" onClick={cerrarFormulario} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Precio</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id_producto} className="border-t">
                  <td className="px-4 py-3">{p.id_producto}</td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3">Q{p.precio}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.estado}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminar(p.id_producto)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
        <Footer />
    </div>
  )
}

export default AdminProductosVista