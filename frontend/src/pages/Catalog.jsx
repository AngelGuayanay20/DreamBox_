import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useProductos } from "../context/ProductsContext";
import ProductGrid from "../components/ProductGrid";

const FILTROS = [
  { valor: "Todos", texto: "Todos" },
  { valor: "PC", texto: "🖥️ PC" },
  { valor: "PlayStation", texto: "🎮 PlayStation" },
  { valor: "Xbox", texto: "🟢 Xbox" },
  { valor: "Nintendo", texto: "🔴 Nintendo" },
];

export default function Catalog() {
  usePagina("DreamBox | Tienda de videojuegos", "body");
  const { productos, cargarProductos } = useProductos();
  const [params] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  // El filtro inicial puede venir de la URL: #/catalogo?plataforma=PC
  const [plataforma, setPlataforma] = useState(params.get("plataforma") || "Todos");

  useEffect(() => { cargarProductos(); }, [cargarProductos]);
  useEffect(() => { setPlataforma(params.get("plataforma") || "Todos"); }, [params]);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) &&
        (plataforma === "Todos" || p.plataforma.includes(plataforma))
    );
  }, [productos, busqueda, plataforma]);

  return (
    <main className="catalog-page">
      <div className="catalog-header">
        <h1>Tienda de videojuegos</h1>
        <span>Encuentra tus próximos títulos para PC, PlayStation, Xbox y Nintendo.</span>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar videojuego..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="filters">
        {FILTROS.map(({ valor, texto }) => (
          <button
            key={valor}
            className={"filter" + (plataforma === valor ? " active" : "")}
            onClick={() => setPlataforma(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <div id="catalogo-productos-container">
        <ProductGrid productos={filtrados} />
      </div>
    </main>
  );
}
