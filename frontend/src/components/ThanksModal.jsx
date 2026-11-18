import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ThanksModal() {
  const { graciasAbierto, setGraciasAbierto } = useCart();
  const navigate = useNavigate();

  function seguirExplorando() {
    setGraciasAbierto(false);
    navigate("/catalogo");
  }

  return (
    <div className={"checkout-overlay" + (graciasAbierto ? " show" : "")}>
      <div className="checkout-box gracias-box" role="dialog" aria-modal="true">
        <div className="gracias-icono">🎮</div>
        <h2>¡Gracias por su compra!</h2>
        <p>Tu pedido fue registrado correctamente.</p>
        <div className="gracias-botones">
          <button type="button" className="btn-seguir" onClick={seguirExplorando}>Seguir explorando</button>
          <a className="btn-whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/593967597622">
            Comunícate con nosotros
          </a>
        </div>
      </div>
    </div>
  );
}
