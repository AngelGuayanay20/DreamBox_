import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ producto }) {
  const { agregar } = useCart();
  const agotado = Number(producto.stock) <= 0;

  return (
    <article className="product-card catalog-product">
      <img src={producto.imagen} alt={producto.nombre} />

      <div className="product-info">
        <span className="platform-tag">{producto.plataforma.join(" / ")}</span>
        <h3>{producto.nombre}</h3>
        <p className="product-stock">{agotado ? "❌ Agotado" : "📦 Stock: " + producto.stock}</p>
        <p className="price">${Number(producto.precio).toFixed(2)}</p>

        <div className="product-actions">
          <Link to={`/detalle/${producto.id}`} className="details-button" style={{ display: "block", textAlign: "center" }}>
            Ver detalles
          </Link>
          {agotado ? (
            <button className="buy-button disabled" disabled>Agotado</button>
          ) : (
            <button className="buy-button" onClick={() => agregar(producto)}>🛒 Agregar</button>
          )}
        </div>
      </div>
    </article>
  );
}
