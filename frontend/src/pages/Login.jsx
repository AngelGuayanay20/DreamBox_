import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import PasswordInput from "../components/PasswordInput";
import { API_URL, MSG_SERVIDOR_DESPIERTA, fetchConTimeout } from "../services/api";

export default function Login() {
  usePagina("DreamBox | Iniciar sesión", "auth-body");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { guardarSesion } = useAuth();
  const mostrarModal = useModal();
  const navigate = useNavigate();

  async function iniciarSesion(e) {
    e.preventDefault();
    setEnviando(true);

    let respuesta;
    try {
      respuesta = await fetchConTimeout(API_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
    } catch {
      setEnviando(false);
      await mostrarModal(MSG_SERVIDOR_DESPIERTA);
      return;
    }
    setEnviando(false);

    let data;
    try {
      data = await respuesta.json();
    } catch {
      await mostrarModal("El servidor respondió algo inesperado. Inténtalo de nuevo en unos segundos.");
      return;
    }

    if (!respuesta.ok) {
      await mostrarModal(data.error || "Correo o contraseña incorrectos.");
      return;
    }

    guardarSesion(data.token, data.usuario);
    navigate(data.usuario.rol === "admin" ? "/admin" : "/");
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <Link to="/"><span id="dream">DREAM</span><span id="box">BOX</span></Link>
      </div>

      <h1>Iniciar sesión</h1>
      <p>Ingresa a tu cuenta para comprar y reservar experiencias.</p>

      <form onSubmit={iniciarSesion}>
        <label htmlFor="login-email">Correo electrónico</label>
        <input id="login-email" type="email" placeholder="tucorreo@ejemplo.com" required
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="login-password">Contraseña</label>
        <PasswordInput id="login-password" placeholder="••••••••" required
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className="auth-button" disabled={enviando}>
          {enviando ? "Conectando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="auth-link">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
      <Link to="/" className="back-home">← Volver al inicio</Link>
    </div>
  );
}
