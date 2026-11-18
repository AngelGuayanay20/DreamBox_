import { useEffect } from "react";
import { Link } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useProductos } from "../context/ProductsContext";
import Hero from "../components/home/Hero";
import BottomBar from "../components/home/BottomBar";
import InfoSection from "../components/home/InfoSection";
import ContactInfo from "../components/home/ContactInfo";
import ContactForm from "../components/ContactForm";
import ProductGrid from "../components/ProductGrid";

const PLATAFORMAS = [
  { texto: "Todos", query: "" },
  { texto: "🖥️ PC", query: "PC" },
  { texto: "🎮 PlayStation", query: "PlayStation" },
  { texto: "🟢 Xbox", query: "Xbox" },
  { texto: "🔴 Nintendo", query: "Nintendo" },
];

export default function Home() {
  usePagina("DreamBox | La cabina portátil con IA", "db-body");
  const { productos, cargarProductos } = useProductos();

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  return (
    <>
      <Hero />
      <BottomBar />
      <InfoSection />

      <section className="store-section" id="tienda">
        <div className="store-header">
          <p className="store-title">TIENDA DREAMBOX</p>
          <h2>Videojuegos para tu cabina</h2>
          <span>Compra los títulos más populares para PC, PlayStation, Xbox y Nintendo.</span>
        </div>

        <div className="platform-pills">
          {PLATAFORMAS.map(({ texto, query }) => (
            <Link key={texto} to={query ? `/catalogo?plataforma=${query}` : "/catalogo"}>{texto}</Link>
          ))}
        </div>

        <ProductGrid productos={productos} />

        <div className="store-button">
          <Link to="/catalogo" className="button-xp">Ver catálogo completo</Link>
        </div>
      </section>

      <section className="contact-section" id="contacto">
        <div className="store-header">
          <p className="store-title">CONTÁCTANOS</p>
          <h2>¿Listo para la próxima partida?</h2>
          <span>Estamos aquí para ayudarte.</span>
        </div>

        <div className="contact-grid">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
