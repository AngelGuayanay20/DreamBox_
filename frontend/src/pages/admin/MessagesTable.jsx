export default function MessagesTable({ mensajes, error, cargando }) {
  const sinDatos = error || mensajes.length === 0;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Celular</th><th>Mensaje</th></tr>
        </thead>
        <tbody>
          {sinDatos ? (
            !cargando && (
              <tr>
                <td colSpan="5" className="empty-table">{error || "Todavía no hay mensajes."}</td>
              </tr>
            )
          ) : (
            mensajes.map((m) => (
              <tr key={m._id}>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>{m.nombre}</td>
                <td>{m.email}</td>
                <td>{m.telefono}</td>
                <td>{m.mensaje}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
