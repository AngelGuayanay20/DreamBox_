import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import ThanksModal from "./ThanksModal";

// Estructura común de Inicio, Catálogo y Detalle: header + contenido + footer + carrito/checkout.
export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar mostrarReservar={pathname === "/"} />
      <Outlet />
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <ThanksModal />
    </>
  );
}
