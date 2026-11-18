import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useCart } from "../context/CartContext";
import { useProductos } from "../context/ProductsContext";

export default function Detail() {
  usePagina("DreamBox | Detalle del videojuego", "body");
  const { id } = useParams();
  const { productos, cargando, cargarProductos } = useProductos();
  const { agregar } = useCart();

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const producto = productos.find((p) => p.id === Number(id));

  let contenido;
  if (!producto) {
    contenido = <p>{cargando ? "Cargando videojuego…" : "Videojuego no encontrado."}</p>;
  } else {
    contenido = (
      <>
        <img id="detail-image" src={producto.imagen} alt={producto.nombre} />

        <div className="detail-info">
          <span className="platform-tag">{producto.plataforma.join(" / ")}</span>
          <h1>{producto.nombre}</h1>
          <p className="genero">{producto.genero}</p>
          <p className="descripcion">{producto.descripcion}</p>
          <p className="price">${Number(producto.precio).toFixed(2)}</p>
          <p className="product-stock">
            {producto.stock > 0 ? "📦 Stock: " + producto.stock : "❌ Agotado"}
          </p>

          {producto.stock > 0 ? (
            <button className="buy-button" onClick={() => agregar(producto)}>🛒 Agregar al carrito</button>
          ) : (
            <button className="buy-button disabled" disabled>Agotado</button>
          )}
        </div>
      </>
    );
  }

  return (
    <main className="detail-page">
      <div className="detail-container">{contenido}</div>
      <Link to="/catalogo" className="back-catalog">← Volver al catálogo</Link>
    </main>
  );
}
