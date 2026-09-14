export const calcularPasoActual = (estadoActual) => {
  if (['Pendiente', 'Confirmado', 'En preparación'].includes(estadoActual)) return 1
  if (estadoActual === 'En ruta' || estadoActual === 'en ruta') return 2
  if (estadoActual === 'Entregado') return 3
  return 0
}