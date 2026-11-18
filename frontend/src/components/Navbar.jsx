import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useModal } from "../context/ModalContext";
import { scrollToSection } from "../utils/scroll";

const SECCIONES = [
  { id: "caracteristicas", texto: "CARACTERÍSTICAS" },
  { id: "experiencias", texto: "EXPERIENCIAS" },
];

export default function Navbar({ mostrarReservar = false }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, cerrarSesion } = useAuth();
  const { totalItems, setCarritoAbierto } = useCart();
  const mostrarModal = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  // Si se agranda la ventana a escritorio con el menú móvil abierto, se cierra.
  useEffect(() => {
    const alCambiarTamano = () => window.innerWidth >= 1024 && setMenuAbierto(false);
    window.addEventListener("resize", alCambiarTamano);
    return () => window.removeEventListener("resize", alCambiarTamano);
  }, []);

  function irASeccion(e, id) {
    e.preventDefault();
    setMenuAbierto(false);
    if (location.pathname === "/") scrollToSection(id);
    else navigate("/", { state: { scrollTo: id } });
  }

  async function irAlPanelAdmin() {
    if (!usuario || usuario.rol !== "admin") {
      await mostrarModal("No tienes permisos para acceder al panel de administrador.");
      return;
    }
    navigate("/admin");
  }

  const enlaceSeccion = ({ id, texto }) => (
    <a key={id} href="#/" onClick={(e) => irASeccion(e, id)}>{texto}</a>
  );

  return (
    <header className="header">
      <div className="logo">
        <Link to="/"><p>DREAM<span>BOX</span></p></Link>
      </div>

      <nav className={"nav" + (menuAbierto ? " active" : "")} id="nav-menu">
        <Link to="/" onClick={() => setMenuAbierto(false)}>INICIO</Link>
        {enlaceSeccion(SECCIONES[0])}
        {enlaceSeccion(SECCIONES[1])}
        <Link to="/catalogo" onClick={() => setMenuAbierto(false)}>TIENDA</Link>
        {enlaceSeccion({ id: "contacto", texto: "CONTACTO" })}
      </nav>

      <button
        className={"hamburger-btn" + (menuAbierto ? " active" : "")}
        onClick={() => setMenuAbierto((v) => !v)}
        aria-label="Abrir menú"
        aria-expanded={menuAbierto}
        aria-controls="nav-menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className="header-actions">
        {mostrarReservar && (
          <button className="reserve-button" onClick={() => scrollToSection("contacto")}>
            RESERVAR AHORA
          </button>
        )}

        <button className="cart-button" title="Carrito" onClick={() => setCarritoAbierto(true)}>
          🛒
          <span id="contador-carrito">{totalItems}</span>
        </button>

        {!usuario && (
          <Link to="/login" className="user-icon" title="Iniciar sesión">👤</Link>
        )}

        <span id="usuario-menu">{usuario ? `👤 ${usuario.nombre}` : ""}</span>

        {usuario?.rol === "admin" && (
          <button className="reserve-button" onClick={irAlPanelAdmin}>
            Panel de administrador
          </button>
        )}

        {usuario && (
          <button className="logout-button" onClick={cerrarSesion}>Cerrar sesión</button>
        )}
      </div>
    </header>
  );
}
