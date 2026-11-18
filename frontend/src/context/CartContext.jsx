import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useModal } from "./ModalContext";
import { useProductos } from "./ProductsContext";

const CartContext = createContext(null);

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
  } catch {
    return [];
  }
}

const mismoId = (a, b) => String(a) === String(b);

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarrito);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [graciasAbierto, setGraciasAbierto] = useState(false);
  const { productos } = useProductos();
  const mostrarModal = useModal();

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregar = useCallback((producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => mismoId(p.id, producto.id));
      if (existe) {
        return prev.map((p) => (mismoId(p.id, producto.id) ? { ...p, cantidad: p.cantidad + 1 } : p));
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1,
        },
      ];
    });
    setCarritoAbierto(true);
  }, []);

  const eliminar = useCallback((id) => {
    setCarrito((prev) => prev.filter((p) => !mismoId(p.id, id)));
  }, []);

  const cambiarCantidad = useCallback((id, delta) => {
    setCarrito((prev) =>
      prev
        .map((p) => (mismoId(p.id, id) ? { ...p, cantidad: p.cantidad + delta } : p))
        .filter((p) => p.cantidad > 0)
    );
  }, []);

  const establecerCantidad = useCallback(
    async (id, valor) => {
      const item = carrito.find((p) => mismoId(p.id, id));
      if (!item) return;

      let cantidad = parseInt(valor, 10);
      if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
      if (cantidad > 99) cantidad = 99;

      const producto = productos.find((p) => mismoId(p.id, id));
      let avisarStock = false;
      if (producto && Number(producto.stock) > 0 && cantidad > Number(producto.stock)) {
        cantidad = Number(producto.stock);
        avisarStock = true;
      }

      setCarrito((prev) => prev.map((p) => (mismoId(p.id, id) ? { ...p, cantidad } : p)));

      if (avisarStock) {
        await mostrarModal("Solo hay " + cantidad + " unidades disponibles de " + item.nombre + ".");
      }
    },
    [carrito, productos, mostrarModal]
  );

  const vaciar = useCallback(() => setCarrito([]), []);

  const totalItems = carrito.reduce((suma, i) => suma + i.cantidad, 0);
  const subtotal = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        carrito, totalItems, subtotal,
        agregar, eliminar, cambiarCantidad, establecerCantidad, vaciar,
        carritoAbierto, setCarritoAbierto,
        checkoutAbierto, setCheckoutAbierto,
        graciasAbierto, setGraciasAbierto,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
