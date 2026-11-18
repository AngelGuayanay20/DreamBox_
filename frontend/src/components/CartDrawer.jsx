import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useModal } from "../context/ModalContext";
import QuantityInput from "./QuantityInput";

export default function CartDrawer() {
  const {
    carrito, subtotal, carritoAbierto, setCarritoAbierto, setCheckoutAbierto,
    cambiarCantidad, eliminar,
  } = useCart();
  const { usuario } = useAuth();
  const mostrarModal = useModal();
  const navigate = useNavigate();

  async function abrirCheckout() {
    if (!usuario) {
      await mostrarModal("Debes iniciar sesión para realizar la compra.");
      setCarritoAbierto(false);
      navigate("/login");
      return;
    }
    if (carrito.length === 0) {
      await mostrarModal("Tu carrito está vacío.");
      return;
    }
    setCarritoAbierto(false);
    setCheckoutAbierto(true);
  }

  return (
    <div className={"cart-overlay" + (carritoAbierto ? " show" : "")}>
      <div className="cart">
        <div className="cart-header">
          <h2>🛒 Tu carrito</h2>
          <button onClick={() => setCarritoAbierto(false)}>✕</button>
        </div>

        <div className="cart-products">
          {carrito.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            carrito.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.imagen || ""} alt={item.nombre} />
                <div className="cart-item-info">
                  <h4>{item.nombre}</h4>
                  <span className="cart-item-price">${(item.precio * item.cantidad).toFixed(2)}</span>
                  <div className="quantity">
                    <button onClick={() => cambiarCantidad(item.id, -1)}>−</button>
                    <QuantityInput item={item} />
                    <button onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                  </div>
                  <button className="remove-button" onClick={() => eliminar(item.id)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <button className="checkout-button" onClick={abrirCheckout}>Proceder al pago</button>
        </div>
      </div>
    </div>
  );
}
