export default function AdminStats({ productos, usuarios, ventas }) {
  const stockTotal = productos.reduce((t, p) => t + Number(p.stock), 0);
  const dinero = ventas.reduce((t, v) => t + v.total, 0);

  const tarjetas = [
    ["🎮", "Videojuegos", productos.length],
    ["👥", "Clientes", usuarios.filter((u) => u.rol === "usuario").length],
    ["🛒", "Ventas", ventas.length],
    ["📦", "Stock total", stockTotal],
    ["💰", "Dinero vendido", "$" + dinero.toFixed(2)],
  ];

  return (
    <div className="admin-stats">
      {tarjetas.map(([icono, titulo, valor]) => (
        <div className="stat-card" key={titulo}>
          <span>{icono}</span>
          <div>
            <small>{titulo}</small>
            <strong>{valor}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
