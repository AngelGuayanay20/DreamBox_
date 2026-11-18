import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { API_URL, fetchConTimeout, obtenerToken } from "../services/api";

// Verifica el rol con el servidor (/api/yo) antes de mostrar el panel, como verificarAdmin() original.
export default function AdminRoute({ children }) {
  const [verificado, setVerificado] = useState(false);
  const { actualizarUsuario } = useAuth();
  const mostrarModal = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    async function verificar() {
      const token = obtenerToken();
      let esAdmin = false;

      if (token) {
        try {
          const respuesta = await fetchConTimeout(API_URL + "/api/yo", {
            headers: { Authorization: "Bearer " + token },
          });
          if (respuesta.ok) {
            const data = await respuesta.json();
            esAdmin = data.usuario.rol === "admin";
            if (esAdmin && activo) actualizarUsuario(data.usuario);
          }
        } catch {
          esAdmin = false;
        }
      }

      if (!activo) return;

      if (esAdmin) {
        setVerificado(true);
      } else {
        await mostrarModal("No tienes permisos para acceder al panel de administrador.");
        navigate("/", { replace: true });
      }
    }

    verificar();
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return verificado ? children : null;
}
