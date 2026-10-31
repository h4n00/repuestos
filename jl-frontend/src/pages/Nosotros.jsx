import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState } from 'react'


function Nosotros() {
  const [abierta, setAbierta] = useState(null)

const faqs = [
  {
    pregunta: '¿Puedo pagar cuando reciba el pedido?',
    respuesta: 'Sí. La opción Efectivo contra entrega te permite pagar al repartidor cuando tengas el paquete en tus manos.'
  },
  {
    pregunta: '¿Cómo pago con tarjeta?',
    respuesta: 'Puedes pagar con tarjeta dentro de la ventana segura de PayPal (sin necesidad de crear cuenta), o directamente con tu cuenta PayPal.'
  },
  {
    pregunta: '¿Cómo sigo mi pedido?',
    respuesta: 'Al confirmar la compra, tu pedido aparece en "Mis pedidos" con una barra de progreso en tiempo real: Pendiente → En preparación → En ruta → Entregado.'
  },
  {
    pregunta: '¿Me dan factura?',
    respuesta: 'Sí, cada pedido genera su factura en PDF con NIT, descargable desde "Mis pedidos".'
  },
  {
    pregunta: '¿Qué pasa si el repuesto no le queda a mi moto?',
    respuesta: 'Cada producto muestra la lista de marcas y modelos compatibles. Si tienes dudas, contáctanos antes de comprar y te asesoramos.'
  }
]
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

          <div className="bg-white rounded-lg shadow p-8 mt-6">
  <h2 className="text-2xl font-bold text-orange-600 mb-6">Formas de pago</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="text-center">
      <div className="text-5xl mb-3">💵</div>
      <h3 className="font-bold text-gray-800 mb-2">Efectivo contra entrega</h3>
      <p className="text-sm text-gray-600">
        Paga en efectivo cuando recibas tu pedido en la puerta de tu casa.
      </p>
    </div>

    <div className="text-center">
      <div className="text-5xl mb-3">🅿️</div>
      <h3 className="font-bold text-gray-800 mb-2">PayPal</h3>
      <p className="text-sm text-gray-600">
        Paga con tu saldo de PayPal desde la ventana segura, sin salir de la tienda.
      </p>
    </div>

    <div className="text-center">
      <div className="text-5xl mb-3">💳</div>
      <h3 className="font-bold text-gray-800 mb-2">Tarjeta de crédito o débito</h3>
      <p className="text-sm text-gray-600">
        Visa, Mastercard y American Express mediante la pasarela segura de PayPal.
      </p>
    </div>
  </div>
</div>

<div className="bg-white rounded-lg shadow p-8 mt-6">
  <h2 className="text-2xl font-bold text-orange-600 mb-4">Preguntas frecuentes</h2>
  <div className="space-y-2">
    {faqs.map((faq, idx) => (
      <div key={idx} className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setAbierta(abierta === idx ? null : idx)}
          className="w-full text-left py-3 flex justify-between items-center hover:text-orange-600 transition"
        >
          <span className="font-semibold text-gray-800">{faq.pregunta}</span>
          <span className="text-orange-600 text-xl">{abierta === idx ? '−' : '+'}</span>
        </button>
        {abierta === idx && (
          <p className="text-gray-700 pb-3 pl-1">{faq.respuesta}</p>
        )}
      </div>
    ))}
  </div>
</div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Nosotros