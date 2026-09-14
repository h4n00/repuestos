import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { CarritoProvider } from './context/CarritoContext'
import { AuthProvider } from './context/AuthContext'
import { NotificacionProvider } from './context/NotificacionContext'
import './index.css'
import App from './App.jsx'

const paypalOptions = {
  "client-id": "BAAFzw8I5o_pGN0hjGGh5TRLOd1VoBMPwZr5GtjCYak4G04owVV7pMtgLBLz4dtWqQUxTiMXo6Ym0Up_qU",
  currency: "USD",
  intent: "capture"
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificacionProvider>
          <CarritoProvider>
            <PayPalScriptProvider options={paypalOptions}>
              <App />
            </PayPalScriptProvider>
          </CarritoProvider>
        </NotificacionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)