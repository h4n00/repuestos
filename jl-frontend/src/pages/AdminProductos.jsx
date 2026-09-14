import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import { listarProductos } from '../services/productos'
import { crearProducto, actualizarProducto, eliminarProducto, subirImagen } from '../services/adminProductos'
import api from '../services/api'
import AdminProductosVista from '../components/AdminProductosVista'

function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [modelos, setModelos] = useState([])
  const [cargando, setCargando] = useState(true)

  const { estaLogueado, usuario } = useAuth()
 const { mostrarNotificacion, confirmar } = useNotificacion()
  const navigate = useNavigate()

  const cargarDatos = async () => {
    try {
      const [prods, catalogo] = await Promise.all([
        listarProductos(),
        api.get('/catalogo').then(r => r.data)
      ])
      setProductos(prods)
      setCategorias(catalogo.filter(c => c.tipo === 'Categoria'))
      setModelos(catalogo.filter(c => c.tipo === 'Modelo'))
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!estaLogueado || usuario?.rol !== 'Admin') {
      navigate('/')
      return
    }
    cargarDatos()
  }, [estaLogueado, usuario, navigate])

  const handleCrear = async (formulario) => {
    try {
      const resp = await crearProducto({
        nombre: formulario.nombre,
        descripcion: formulario.descripcion || null,
        precio: formulario.precio,
        stock: formulario.stock,
        id_categoria: formulario.id_categoria,
        estado: formulario.estado,
        imagen_url: null,
        compatibilidad_ids: formulario.compatibilidad_ids
      })

      if (formulario.archivo) {
        const imagenResp = await subirImagen(
          formulario.archivo,
          resp.id_producto,
          formulario.nombre,
          formulario.id_categoria
        )
        await actualizarProducto(resp.id_producto, { imagen_url: imagenResp.imagen_url })
      }

      mostrarNotificacion('Producto creado correctamente', 'exito')
      cargarDatos()
    } catch (err) {
      mostrarNotificacion(err.response?.data?.detail || 'Error al crear producto', 'error')
    }
  }

  const handleActualizar = async (idProducto, formulario) => {
    try {
      const datos = {
        nombre: formulario.nombre,
        descripcion: formulario.descripcion || null,
        precio: formulario.precio,
        stock: formulario.stock,
        id_categoria: formulario.id_categoria,
        estado: formulario.estado,
        compatibilidad_ids: formulario.compatibilidad_ids
      }

      if (formulario.archivo) {
        const imagenResp = await subirImagen(
          formulario.archivo,
          idProducto,
          formulario.nombre,
          formulario.id_categoria
        )
        datos.imagen_url = imagenResp.imagen_url
      }

      await actualizarProducto(idProducto, datos)
      mostrarNotificacion('Producto actualizado correctamente', 'exito')
      cargarDatos()
    } catch (err) {
      mostrarNotificacion(err.response?.data?.detail || 'Error al actualizar producto', 'error')
    }
  }

  const handleEliminar = async (idProducto) => {
  const confirmado = await confirmar('¿Estás seguro de eliminar este producto?')
  if (!confirmado) return
  try {
    await eliminarProducto(idProducto)
    mostrarNotificacion('Producto eliminado', 'exito')
    cargarDatos()
  } catch (err) {
    mostrarNotificacion(err.response?.data?.detail || 'Error al eliminar producto', 'error')
  }
}

  return (
    <AdminProductosVista
      productos={productos}
      categorias={categorias}
      modelos={modelos}
      onCrear={handleCrear}
      onActualizar={handleActualizar}
      onEliminar={handleEliminar}
      cargando={cargando}
    />
  )
}

export default AdminProductos