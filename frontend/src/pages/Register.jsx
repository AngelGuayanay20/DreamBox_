import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useModal } from "../context/ModalContext";
import PasswordInput from "../components/PasswordInput";
import { API_URL, MSG_SERVIDOR_DESPIERTA, fetchConTimeout } from "../services/api";

export default function Register() {
  usePagina("DreamBox | Crear cuenta", "auth-body");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const mostrarModal = useModal();
  const navigate = useNavigate();

  async function registrarUsuario(e) {
    e.preventDefault();
    setEnviando(true);

    let respuesta;
    try {
      respuesta = await fetchConTimeout(API_URL + "/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim().toLowerCase(), password }),
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
      await mostrarModal(data.error || "No se pudo crear la cuenta.");
      return;
    }

    await mostrarModal("Cuenta creada correctamente. Ahora inicia sesión.");
    navigate("/login");
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <Link to="/"><span id="dream">DREAM</span><span id="box">BOX</span></Link>
      </div>

      <h1>Crear cuenta</h1>
      <p>Regístrate para comprar videojuegos y reservar tu cabina.</p>

      <form onSubmit={registrarUsuario}>
        <label htmlFor="registro-nombre">Nombre completo</label>
        <input id="registro-nombre" type="text" placeholder="Tu nombre" required
          value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label htmlFor="registro-email">Correo electrónico</label>
        <input id="registro-email" type="email" placeholder="tucorreo@ejemplo.com" required
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="registro-password">Contraseña</label>
        <PasswordInput id="registro-password" placeholder="Mínimo 6 caracteres" minLength={6} required
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className="auth-button" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
      <Link to="/" className="back-home">← Volver al inicio</Link>
    </div>
  );
}
