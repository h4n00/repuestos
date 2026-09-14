import { useState } from 'react'

function Estrellas({ valor, onCambio, tamano = 'md', soloLectura = false }) {
  const [hover, setHover] = useState(0)

  const clases = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const claseTamano = clases[tamano] || clases.md

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => {
        const activa = n <= (hover || valor)
        return (
          <button
            key={n}
            type="button"
            disabled={soloLectura}
            onClick={() => !soloLectura && onCambio && onCambio(n)}
            onMouseEnter={() => !soloLectura && setHover(n)}
            onMouseLeave={() => !soloLectura && setHover(0)}
            className={`${claseTamano} ${activa ? 'text-yellow-400' : 'text-gray-300'} ${
              !soloLectura ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export default Estrellas