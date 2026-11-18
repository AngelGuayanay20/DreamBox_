import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { API_URL, cabecerasAuth, fetchConTimeout, obtenerToken } from "../services/api";

const VACIO = { nombre: "", email: "", telefono: "", mensaje: "" };

export default function ContactForm() {
  const [campos, setCampos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { usuario, limpiarSesion } = useAuth();
  const mostrarModal = useModal();
  const navigate = useNavigate();

  const cambiar = (campo) => (e) => setCampos((c) => ({ ...c, [campo]: e.target.value }));

  function validar() {
    const nuevos = {};
    const { nombre, email, telefono, mensaje } = campos;

    if (!nombre.trim()) nuevos.nombre = "El nombre es obligatorio.";

    if (!email.trim()) nuevos.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nuevos.email = "Ingresa un correo válido.";

    if (!telefono.trim()) nuevos.telefono = "El teléfono es obligatorio.";
    else if (!/^[0-9+\s-]{7,15}$/.test(telefono.trim())) nuevos.telefono = "Ingresa un teléfono válido.";

    if (!mensaje.trim()) nuevos.mensaje = "El mensaje es obligatorio.";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();

    if (!usuario || !obtenerToken()) {
      await mostrarModal("Debes iniciar sesión para enviar un mensaje.");
      navigate("/login");
      return;
    }

    setExito("");
    if (!validar()) return;

    setEnviando(true);
    try {
      const respuesta = await fetchConTimeout(API_URL + "/api/contacto", {
        method: "POST",
        headers: cabecerasAuth(true),
        body: JSON.stringify({
          nombre: campos.nombre.trim(),
          email: campos.email.trim(),
          telefono: campos.telefono.trim(),
          mensaje: campos.mensaje.trim(),
        }),
      });

      if (respuesta.status === 401) {
        limpiarSesion();
        await mostrarModal("Tu sesión expiró. Inicia sesión de nuevo para enviar el mensaje.");
        navigate("/login");
        return;
      }

      if (!respuesta.ok) throw new Error("Respuesta no válida");

      setExito("¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.");
      setCampos(VACIO);
    } catch {
      setErrores({ mensaje: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={enviar} noValidate>
      <div className="form-group">
        <label htmlFor="contact-nombre">Nombre</label>
        <input type="text" id="contact-nombre" placeholder="Tu nombre completo" value={campos.nombre} onChange={cambiar("nombre")} />
        <span className="form-error">{errores.nombre}</span>
      </div>

      <div className="form-group">
        <label htmlFor="contact-email">Correo electrónico</label>
        <input type="email" id="contact-email" placeholder="tucorreo@ejemplo.com" value={campos.email} onChange={cambiar("email")} />
        <span className="form-error">{errores.email}</span>
      </div>

      <div className="form-group">
        <label htmlFor="contact-telefono">Celular</label>
        <input type="tel" id="contact-telefono" placeholder="Numero celular o Telefono " value={campos.telefono} onChange={cambiar("telefono")} />
        <span className="form-error">{errores.telefono}</span>
      </div>

      <div className="form-group">
        <label htmlFor="contact-mensaje">Mensaje</label>
        <textarea id="contact-mensaje" placeholder="Cuéntanos qué necesitas..." value={campos.mensaje} onChange={cambiar("mensaje")} />
        <span className="form-error">{errores.mensaje}</span>
      </div>

      <button type="submit" className="button-xp" disabled={enviando}>ENVIAR MENSAJE</button>

      <p className="form-success">{exito}</p>
    </form>
  );
}
