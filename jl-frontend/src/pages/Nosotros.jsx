import Header from '../components/Header'
import Footer from '../components/Footer'

function Nosotros() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Sobre JL Repuestos</h1>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Quiénes Somos</h2>
          <p className="text-gray-700 leading-relaxed">
            JL Repuestos es una tienda en línea guatemalteca especializada en la venta de
            repuestos y accesorios para motocicletas. Nos enfocamos en ofrecer productos de
            calidad a precios accesibles, con la comodidad de comprar desde casa y recibir
            los pedidos donde el cliente lo indique. Trabajamos con las principales marcas
            de motos del mercado nacional: Honda, Yamaha, Suzuki e Italika.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Misión</h2>
            <p className="text-gray-700 leading-relaxed">
              Ofrecer repuestos y accesorios de moto de calidad a precios accesibles para
              los motociclistas de Guatemala, brindando un servicio confiable, seguro y con
              entrega en todo el país.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Visión</h2>
            <p className="text-gray-700 leading-relaxed">
              Ser el proveedor en línea preferido de repuestos de moto en Guatemala,
              reconocidos por nuestra calidad, servicio al cliente y cobertura nacional.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Nosotros