import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useModal } from "../context/ModalContext";
import { useProductos } from "../context/ProductsContext";
import { API_URL, MSG_SERVIDOR_DESPIERTA, cabecerasAuth, fetchConTimeout } from "../services/api";

const VACIO = { nombre: "", email: "", telefono: "", metodo: "", cupon: "" };

export default function CheckoutModal() {
  const { usuario } = useAuth();
  const { carrito, subtotal, checkoutAbierto, setCheckoutAbierto, setGraciasAbierto, vaciar } = useCart();
  const { cargarProductos } = useProductos();
  const mostrarModal = useModal();

  const [campos, setCampos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  // Al abrir: se prellenan nombre y correo con la sesión y se limpia el resto.
  useEffect(() => {
    if (checkoutAbierto) {
      setCampos({ ...VACIO, nombre: usuario?.nombre || "", email: usuario?.email || "" });
      setErrores({});
    }
  }, [checkoutAbierto, usuario]);

  useEffect(() => {
    const alPulsar = (e) => e.key === "Escape" && setCheckoutAbierto(false);
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [setCheckoutAbierto]);

  const cambiar = (campo) => (e) => setCampos((c) => ({ ...c, [campo]: e.target.value }));

  function validar() {
    const nuevos = {};
    if (!campos.metodo) nuevos.metodo = "Selecciona un método de pago.";
    if (!campos.nombre.trim()) nuevos.nombre = "El nombre es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.trim())) nuevos.email = "Ingresa un correo válido.";
    if (!/^[0-9+\s-]{10,15}$/.test(campos.telefono.trim())) nuevos.telefono = "Ingresa un teléfono válido";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function finalizarCompra() {
    let respuesta;
    try {
      respuesta = await fetchConTimeout(API_URL + "/api/compra", {
        method: "POST",
        headers: cabecerasAuth(true),
        body: JSON.stringify({ items: carrito.map((i) => ({ id: i.id, cantidad: i.cantidad })) }),
      });
    } catch {
      await mostrarModal("No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.");
      return;
    }

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      await mostrarModal(data.error || "No se pudo procesar la compra.");
      cargarProductos();
      return;
    }

    vaciar();
    setCheckoutAbierto(false);
    setGraciasAbierto(true);
    cargarProductos();
  }

  async function confirmarCompra(e) {
    e.preventDefault();
    if (!validar()) return;

    if (campos.cupon.trim()) {
      await mostrarModal("Los cupones todavía no están disponibles. Deja el campo vacío para continuar.");
      return;
    }

    setProcesando(true);
    await finalizarCompra();
    setProcesando(false);
  }

  return (
    <div className={"checkout-overlay" + (checkoutAbierto ? " show" : "")}>
      <div className="checkout-box" role="dialog" aria-modal="true" aria-labelledby="checkout-titulo">
        <div className="checkout-header">
          <h2 id="checkout-titulo">🛍️ Finalizar Compra</h2>
          <button type="button" onClick={() => setCheckoutAbierto(false)} aria-label="Cerrar">✕</button>
        </div>

        <form id="checkout-form" onSubmit={confirmarCompra} noValidate>
          <h3>Datos del Comprador</h3>

          <label htmlFor="checkout-nombre">Nombre Completo</label>
          <input id="checkout-nombre" type="text" placeholder="Ej.Alex Lopez" value={campos.nombre} onChange={cambiar("nombre")} />
          <span className="form-error">{errores.nombre}</span>

          <label htmlFor="checkout-email">Correo electrónico de contacto</label>
          <input id="checkout-email" type="email" placeholder="correo@ejemplo.com" value={campos.email} onChange={cambiar("email")} />
          <span className="form-error">{errores.email}</span>
          <small>Usaremos este correo como dato de contacto. Te enviaremos los recibos por correo.</small>

          <label htmlFor="checkout-telefono">Número de teléfono / WhatsApp</label>
          <input id="checkout-telefono" type="tel" placeholder="Ej. 09xxxxxx37" autoComplete="tel" value={campos.telefono} onChange={cambiar("telefono")} />
          <span className="form-error">{errores.telefono}</span>

          <h3>Método de Pago</h3>
          <label htmlFor="checkout-metodo">Selecciona un método de pago</label>
          <select id="checkout-metodo" value={campos.metodo} onChange={cambiar("metodo")}>
            <option value=""> Selecciona un método </option>
            <option value="paypal">PayPal</option>
            <option value="tarjeta">Tarjeta de crédito/débito</option>
            <option value="transferencia">Transferencia bancaria</option>
          </select>
          <span className="form-error">{errores.metodo}</span>

          <h3>Cupón de descuento</h3>
          <label htmlFor="checkout-cupon">Código (opcional)</label>
          <input id="checkout-cupon" type="text" placeholder="Ingresa tu código" autoComplete="off" value={campos.cupon} onChange={cambiar("cupon")} />
          <small>El servidor validará el cupón y calculará el descuento antes del pago.</small>

          <div className="checkout-subtotal">
            <span>Subtotal antes del cupón:</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>

          <button type="submit" className="checkout-confirm" disabled={procesando}>
            {procesando ? "Procesando..." : "Confirmar compra"}
          </button>
        </form>
      </div>
    </div>
  );
}
