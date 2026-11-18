import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "./ModalContext";

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActual") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);
  const mostrarModal = useModal();
  const navigate = useNavigate();

  const guardarSesion = useCallback((token, datosUsuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuarioActual", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }, []);

  const actualizarUsuario = useCallback((datosUsuario) => {
    localStorage.setItem("usuarioActual", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }, []);

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("token");
    setUsuario(null);
  }, []);

  const cerrarSesion = useCallback(async () => {
    const confirmar = await mostrarModal("¿Seguro que deseas cerrar sesión?", true);
    if (!confirmar) return;

    limpiarSesion();
    await mostrarModal("Sesión cerrada correctamente.");
    navigate("/");
  }, [mostrarModal, limpiarSesion, navigate]);

  return (
    <AuthContext.Provider
      value={{ usuario, guardarSesion, actualizarUsuario, limpiarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
