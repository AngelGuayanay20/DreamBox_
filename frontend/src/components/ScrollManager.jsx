import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToSection } from "../utils/scroll";

// Al cambiar de ruta: vuelve arriba, o baja a la sección pedida (p. ej. desde el menú de otra página).
export default function ScrollManager() {
  const { pathname, state } = useLocation();

  useEffect(() => {
    if (state?.scrollTo) {
      const t = setTimeout(() => scrollToSection(state.scrollTo), 50);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
}
