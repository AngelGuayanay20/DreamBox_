// Única fuente de verdad para hablar con el backend (Frontend → API → MongoDB).
export const API_URL = import.meta.env.VITE_API_URL || "https://dreambox.onrender.com";

export function fetchConTimeout(url, opciones = {}, ms = 60000) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), ms);

  return fetch(url, { ...opciones, signal: controlador.signal }).finally(() =>
    clearTimeout(temporizador)
  );
}

export const obtenerToken = () => localStorage.getItem("token");

export function cabecerasAuth(conJson = false) {
  const cabeceras = { Authorization: "Bearer " + obtenerToken() };
  if (conJson) cabeceras["Content-Type"] = "application/json";
  return cabeceras;
}

export const MSG_SERVIDOR_DESPIERTA =
  "No se pudo conectar con el servidor. Puede estar despertando; espera unos segundos e inténtalo de nuevo.";
