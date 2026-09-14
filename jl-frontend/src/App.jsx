import { Routes, Route } from 'react-router-dom'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import Carrito from './pages/Carrito'
import Login from './pages/Login'
import Registro from './pages/Registro'
import ConfirmarCompra from './pages/ConfirmarCompra'
import AgregarDireccion from './pages/AgregarDireccion'
import MisPedidos from './pages/MisPedidos'
import AdminPedidos from './pages/AdminPedidos'
import Notificacion from './components/Notificacion'
import Nosotros from './pages/Nosotros'
import AdminProductos from './pages/AdminProductos'

function App() {
  return (
    <>
      <Notificacion />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/confirmar" element={<ConfirmarCompra />} />
        <Route path="/direcciones/nueva" element={<AgregarDireccion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/admin/pedidos" element={<AdminPedidos />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/admin/productos" element={<AdminProductos />} />
      </Routes>
    </>
  )
}

export default App