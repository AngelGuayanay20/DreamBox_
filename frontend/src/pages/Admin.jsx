import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePagina from "../utils/usePagina";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useProductos } from "../context/ProductsContext";
import { API_URL, MSG_SERVIDOR_DESPIERTA, cabecerasAuth, fetchConTimeout } from "../services/api";
import AdminStats from "./admin/AdminStats";
import ProductForm from "./admin/ProductForm";
import InventoryTable from "./admin/InventoryTable";
import UsersTable from "./admin/UsersTable";
import SalesTable from "./admin/SalesTable";
import MessagesTable from "./admin/MessagesTable";
import useAdminData from "./admin/useAdminData";

export default function Admin() {
  usePagina("DreamBox | Administrador", "admin-body");
  const { productos, error: errorProductos, cargarProductos } = useProductos();
  const usuarios = useAdminData("/api/usuarios");
  const ventas = useAdminData("/api/ventas");
  const mensajes = useAdminData("/api/contacto");
  const { usuario: actual, actualizarUsuario, cerrarSesion } = useAuth();
  const mostrarModal = useModal();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(null);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  // Crea (POST), edita (PUT) o elimina (DELETE) un videojuego y refresca el inventario.
  async function apiProductos(metodo, id, cuerpo) {
    try {
      const respuesta = await fetchConTimeout(API_URL + "/api/productos" + (id ? "/" + id : ""), {
        method: metodo,
        headers: cabecerasAuth(true),
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const data = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        await mostrarModal(data.error || "No se pudo completar la acción.");
        return false;
      }
      await cargarProductos();
      return true;
    } catch {
      await mostrarModal(
        "No se pudo conectar con el servidor. Puede estar despertando; inténtalo de nuevo en unos segundos."
      );
      return false;
    }
  }

  async function guardarProducto(datos) {
    const ok = editando
      ? await apiProductos("PUT", editando.id, datos)
      : await apiProductos("POST", null, datos);
    if (ok) setEditando(null);
    return ok;
  }

  async function eliminarProducto(id) {
    const confirmar = await mostrarModal("¿Eliminar este videojuego?", true);
    if (!confirmar) return;
    const ok = await apiProductos("DELETE", id);
    if (ok && editando?.id === id) setEditando(null);
  }

  async function cambiarRol(objetivo, nuevoRol) {
    const esUnoMismo = actual && actual.email === objetivo.email;

    if (esUnoMismo && nuevoRol !== "admin") {
      const confirmar = await mostrarModal(
        "Estás a punto de quitarte el rol de administrador a ti mismo. ¿Deseas continuar?",
        true
      );
      if (!confirmar) return;
    }

    try {
      const respuesta = await fetchConTimeout(API_URL + "/api/usuarios/" + objetivo.id + "/rol", {
        method: "PUT",
        headers: cabecerasAuth(true),
        body: JSON.stringify({ rol: nuevoRol }),
      });
      const data = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        await mostrarModal(data.error || "No se pudo cambiar el rol.");
        usuarios.recargar();
        return;
      }
    } catch {
      await mostrarModal("No se pudo conectar con el servidor.");
      usuarios.recargar();
      return;
    }

    if (esUnoMismo && nuevoRol !== "admin") {
      actualizarUsuario({ ...actual, rol: nuevoRol });
      navigate("/");
      return;
    }

    usuarios.recargar();
  }

  return (
    <>
      <header className="admin-header">
        <div className="logo">
          <Link to="/"><p>DREAM<span>BOX</span></p></Link>
        </div>
        <div>
          <span>👑 Administrador</span>
          <button className="logout-button1" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <main className="admin-container">
        <div className="admin-title">
          <p>PANEL DE CONTROL</p>
          <h1>Administración</h1>
        </div>

        <AdminStats productos={productos} usuarios={usuarios.datos} ventas={ventas.datos} />

        <section className="admin-section">
          <h2>➕ Agregar videojuego</h2>
          <ProductForm editando={editando} onGuardar={guardarProducto} onCancelar={() => setEditando(null)} />
        </section>

        <section className="admin-section">
          <h2>📦 Inventario</h2>
          <InventoryTable
            productos={productos}
            error={errorProductos}
            onStock={(id, stock) => apiProductos("PUT", id, { stock })}
            onEditar={setEditando}
            onEliminar={eliminarProducto}
          />
        </section>

        <section className="admin-section">
          <div className="section-header-row"><h2>👥 Usuarios registrados</h2></div>
          <UsersTable usuarios={usuarios.datos} error={usuarios.error} cargando={usuarios.cargando} onCambiarRol={cambiarRol} />
        </section>

        <section className="admin-section">
          <h2>🛒 Ventas realizadas</h2>
          <SalesTable ventas={ventas.datos} error={ventas.error} cargando={ventas.cargando} />
        </section>

        <section className="admin-section">
          <h2>✉️ Mensajes de contacto</h2>
          <MessagesTable mensajes={mensajes.datos} error={mensajes.error} cargando={mensajes.cargando} />
        </section>
      </main>
    </>
  );
}
