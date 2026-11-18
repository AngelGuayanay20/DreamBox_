import { useEffect, useRef, useState } from "react";
import { API_URL } from "../services/api";

const SALUDO = "¡Hola! Soy DreamBot 🎮 Cuéntame qué te gusta jugar y te recomiendo un título.";

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([{ id: 0, texto: SALUDO, quien: "bot" }]);
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const historial = useRef([]);
  const contador = useRef(1);
  const listaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensajes]);

  async function enviar(e) {
    e.preventDefault();
    const consulta = texto.trim();
    if (!consulta || esperando) return;

    const idEspera = contador.current + 1;
    contador.current += 2;
    setTexto("");
    setEsperando(true);
    setMensajes((m) => [
      ...m,
      { id: idEspera - 1, texto: consulta, quien: "user" },
      { id: idEspera, texto: "Escribiendo…", quien: "bot" },
    ]);
    historial.current.push({ role: "user", content: consulta });

    const reemplazarEspera = (nuevoTexto) =>
      setMensajes((m) => m.map((x) => (x.id === idEspera ? { ...x, texto: nuevoTexto } : x)));

    try {
      const respuesta = await fetch(API_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historial: historial.current }),
      });
      if (!respuesta.ok) throw new Error("Respuesta no válida");

      const data = await respuesta.json();
      const final = data.respuesta || "No pude responder, intenta de nuevo.";
      reemplazarEspera(final);
      historial.current.push({ role: "assistant", content: final });
    } catch {
      reemplazarEspera("Ahora mismo no puedo responder. Inténtalo más tarde.");
      historial.current.pop(); // quita el mensaje que falló
    } finally {
      setEsperando(false);
    }
  }

  return (
    <div id="chatbot">
      <button className="chat-toggle" aria-label="Abrir asistente" onClick={() => setAbierto((v) => !v)}>🤖</button>

      <div className="chat-panel" hidden={!abierto}>
        <div className="chat-header">
          <strong>DreamBot</strong>
          <button aria-label="Cerrar" onClick={() => setAbierto(false)}>✕</button>
        </div>

        <div className="chat-mensajes" ref={listaRef}>
          {mensajes.map((m) => (
            <div key={m.id} className={"chat-msg " + m.quien}>{m.texto}</div>
          ))}
        </div>

        <form className="chat-form" onSubmit={enviar}>
          <input
            ref={inputRef}
            type="text"
            maxLength={300}
            autoComplete="off"
            placeholder="¿Qué te gusta jugar?"
            required
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  );
}
