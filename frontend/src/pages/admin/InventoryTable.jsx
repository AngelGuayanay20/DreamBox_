import { useModal } from "../../context/ModalContext";

export default function InventoryTable({ productos, error, onStock, onEditar, onEliminar }) {
  const mostrarModal = useModal();
  const ordenados = [...productos].sort((a, b) => a.id - b.id);

  async function confirmarStock(e, producto) {
    const valor = parseInt(e.target.value);
    if (isNaN(valor) || valor < 0) {
      await mostrarModal("Ingresa un número válido (0 o mayor).");
      e.target.value = producto.stock;
      return;
    }
    if (valor === Number(producto.stock)) return;
    const ok = await onStock(producto.id, valor);
    if (!ok) e.target.value = producto.stock;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Videojuego</th><th>Plataforma</th><th>Precio</th><th>Stock</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-table">
                No hay videojuegos{error ? " (no se pudo conectar con el servidor)" : ""}.
              </td>
            </tr>
          ) : (
            ordenados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.plataforma.join(", ")}</td>
                <td>${Number(p.precio).toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    className="stock-input"
                    key={`${p.id}-${p.stock}`}
                    defaultValue={p.stock}
                    onBlur={(e) => confirmarStock(e, p)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                </td>
                <td>
                  <button className="edit-button" onClick={() => onEditar(p)}>Editar</button>
                  <button className="delete-button" onClick={() => onEliminar(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
