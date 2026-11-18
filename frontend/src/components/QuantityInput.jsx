import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

// Igual que el onchange original: la cantidad se confirma al salir del campo o con Enter.
export default function QuantityInput({ item }) {
  const { establecerCantidad } = useCart();
  const [valor, setValor] = useState(String(item.cantidad));

  useEffect(() => setValor(String(item.cantidad)), [item.cantidad]);

  function confirmar() {
    if (valor !== String(item.cantidad)) establecerCantidad(item.id, valor);
    else setValor(String(item.cantidad));
  }

  return (
    <input
      type="number"
      className="quantity-input"
      min="1"
      max="99"
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      aria-label="Cantidad"
    />
  );
}
