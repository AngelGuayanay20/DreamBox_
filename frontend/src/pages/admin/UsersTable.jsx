export default function UsersTable({ usuarios, error, cargando, onCambiarRol }) {
  const sinDatos = error || usuarios.length === 0;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr>
        </thead>
        <tbody>
          {sinDatos ? (
            !cargando && (
              <tr>
                <td colSpan="3" className="empty-table">
                  {error || "Todavía no hay usuarios registrados."}
                </td>
              </tr>
            )
          ) : (
            usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <select className="role-select" value={u.rol} onChange={(e) => onCambiarRol(u, e.target.value)}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
