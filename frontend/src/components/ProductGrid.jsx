import { useProductos } from "../context/ProductsContext";
import ProductCard from "./ProductCard";

// Cuadrícula de videojuegos con los estados de carga / error / vacío del original.
export default function ProductGrid({ productos }) {
  const { error, cargando, productos: todos } = useProductos();

  let aviso = null;
  if (cargando && todos.length === 0) aviso = "Cargando videojuegos…";
  else if (todos.length === 0)
    aviso = error
      ? "No se pudieron cargar los videojuegos. El servidor puede estar despertando; recarga en unos segundos."
      : "No hay videojuegos disponibles.";

  return (
    <div className="product-grid">
      {aviso ? (
        <p className="empty-table">{aviso}</p>
      ) : (
        productos.map((p) => <ProductCard key={p.id} producto={p} />)
      )}
    </div>
  );
}
