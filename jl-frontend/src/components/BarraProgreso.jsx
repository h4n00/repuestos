function BarraProgreso({ pasoActual }) {
  const pasos = ['Procesando', 'En ruta', 'Entregado']

  const porcentajes = {
    1: 10,   // Procesando
    2: 55,   // En ruta
    3: 100   // Entregado
  }

  const porcentaje = porcentajes[pasoActual] || 0

  return (
    <div>
      <div style={{ background: '#e0e0e0', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{
          background: '#ff6b00',
          height: '100%',
          width: `${porcentaje}%`,
          transition: 'width 0.5s'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        {pasos.map((paso, idx) => (
          <span key={idx} style={{
            fontWeight: pasoActual >= idx + 1 ? 'bold' : 'normal',
            color: pasoActual >= idx + 1 ? '#ff6b00' : '#999'
          }}>
            {paso}
          </span>
        ))}
      </div>
    </div>
  )
}

export default BarraProgreso