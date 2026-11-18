import { useEffect } from "react";

// Sustituye el <title> y la clase del <body> que antes tenía cada archivo HTML.
export default function usePagina(titulo, claseBody) {
  useEffect(() => {
    document.title = titulo;
    document.body.className = claseBody;
  }, [titulo, claseBody]);
}
