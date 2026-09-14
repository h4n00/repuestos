import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-3">JL Repuestos</h3>
            <p className="text-sm">
              Repuestos y accesorios de moto en línea. Calidad, servicio y entrega en toda Guatemala.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3">Enlaces</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/" className="hover:text-orange-400">Catálogo</Link></li>
              <li><Link to="/nosotros" className="hover:text-orange-400">Nosotros</Link></li>
              <li><Link to="/mis-pedidos" className="hover:text-orange-400">Mis pedidos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3">Contacto</h3>
            <ul className="text-sm space-y-2">
              <li>📧 contacto@jlrepuestos.gt</li>
              <li>📱 +502 5555-5555</li>
              <li>🕐 Lunes a Viernes, 8:00 a 17:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          © 2026 JL Repuestos. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

export default Footer