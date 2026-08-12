import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([])

  const agregarItem = (producto) => {
    setItems(itemsActuales => {
      const existente = itemsActuales.find(i => i.id_producto === producto.id_producto)
      if (existente) {
        return itemsActuales.map(i =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }


      return [...itemsActuales, { ...producto, cantidad: 1 }]
    })
  }

  const eliminarItem = (id_producto) => {
    setItems(itemsActuales => itemsActuales.filter(i => i.id_producto !== id_producto))
  }

  const vaciarCarrito = () => setItems([])

  const totalItems = items.reduce((suma, i) => suma + i.cantidad, 0)
  const totalPrecio = items.reduce((suma, i) => suma + (i.precio * i.cantidad), 0)

  const aumentarCantidad = (id_producto) => {
  setItems(itemsActuales =>
    itemsActuales.map(i =>
      i.id_producto === id_producto
        ? { ...i, cantidad: i.cantidad + 1 }
        : i
    )
  )
}

const disminuirCantidad = (id_producto) => {
  setItems(itemsActuales =>
    itemsActuales
      .map(i =>
        i.id_producto === id_producto
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      )
      .filter(i => i.cantidad > 0)
  )
}

  return (
    <CarritoContext.Provider value={{ items, agregarItem, eliminarItem, vaciarCarrito, aumentarCantidad, disminuirCantidad, totalItems, totalPrecio }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)