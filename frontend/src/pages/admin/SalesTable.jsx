import { Fragment } from "react";

export default function SalesTable({ ventas, error, cargando }) {
  const sinDatos = error || ventas.length === 0;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Correo</th><th>Productos</th><th>Total</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {sinDatos ? (
            !cargando && (
              <tr>
                <td colSpan="6" className="empty-table">{error || "No existen ventas todavía."}</td>
              </tr>
            )
          ) : (
            ventas.map((v) => (
              <tr key={v.id}>
                <td>#{v.id.slice(-6)}</td>
                <td>{v.usuario.nombre}</td>
                <td>{v.usuario.email}</td>
                <td>
                  {v.productos.map((p, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {p.nombre} x{p.cantidad}
                    </Fragment>
                  ))}
                </td>
                <td><strong>${Number(v.total).toFixed(2)}</strong></td>
                <td>{new Date(v.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
