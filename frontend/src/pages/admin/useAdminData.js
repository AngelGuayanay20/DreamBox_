import { useCallback, useEffect, useState } from "react";
import { API_URL, cabecerasAuth, fetchConTimeout } from "../../services/api";

// Lee una ruta protegida del backend (usuarios, ventas, mensajes) con los mismos mensajes de error que el original.
export default function useAdminData(ruta) {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    try {
      const respuesta = await fetchConTimeout(API_URL + ruta, { headers: cabecerasAuth() });

      if (respuesta.status === 401 || respuesta.status === 403) {
        setDatos([]);
        setError("No autorizado. Vuelve a iniciar sesión.");
      } else if (!respuesta.ok) {
        setDatos([]);
        setError("Respuesta no válida del servidor.");
      } else {
        setDatos(await respuesta.json());
        setError("");
      }
    } catch {
      setDatos([]);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [ruta]);

  useEffect(() => { recargar(); }, [recargar]);

  return { datos, error, cargando, recargar };
}
