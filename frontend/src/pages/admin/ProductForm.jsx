import { useEffect, useRef, useState } from "react";

const VACIO = {
  nombre: "", precio: "", stock: "", plataforma: "", genero: "", imagen: "", descripcion: "",
};

// Formulario para agregar o editar (cuando recibe `editando`) un videojuego.
export default function ProductForm({ editando, onGuardar, onCancelar }) {
  const [campos, setCampos] = useState(VACIO);
  const formRef = useRef(null);

  useEffect(() => {
    if (editando) {
      setCampos({
        nombre: editando.nombre,
        precio: editando.precio,
        stock: editando.stock,
        plataforma: editando.plataforma.join(", "),
        genero: editando.genero,
        imagen: editando.imagen,
        descripcion: editando.descripcion,
      });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setCampos(VACIO);
    }
  }, [editando]);

  const cambiar = (campo) => (e) => setCampos((c) => ({ ...c, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    const ok = await onGuardar({
      nombre: campos.nombre.trim(),
      precio: parseFloat(campos.precio),
      stock: parseInt(campos.stock),
      plataforma: campos.plataforma.split(",").map((p) => p.trim()).filter(Boolean),
      genero: campos.genero.trim(),
      imagen: campos.imagen.trim(),
      descripcion: campos.descripcion.trim(),
    });
    if (ok && !editando) setCampos(VACIO);
  }

  return (
    <form className="admin-form" ref={formRef} onSubmit={enviar}>
      <input type="text" placeholder="Nombre del videojuego" required value={campos.nombre} onChange={cambiar("nombre")} />
      <input type="number" step="0.01" min="0" placeholder="Precio" required value={campos.precio} onChange={cambiar("precio")} />
      <input type="number" min="0" placeholder="Stock" required value={campos.stock} onChange={cambiar("stock")} />
      <input type="text" placeholder="PC, PlayStation, Xbox, Nintendo" required value={campos.plataforma} onChange={cambiar("plataforma")} />
      <input type="text" placeholder="Género" required value={campos.genero} onChange={cambiar("genero")} />
      <input type="url" placeholder="URL de la imagen" required value={campos.imagen} onChange={cambiar("imagen")} />
      <textarea placeholder="Descripción del videojuego" required value={campos.descripcion} onChange={cambiar("descripcion")} />

      <button type="submit" className="admin-add-button">
        {editando ? "Guardar cambios" : "Agregar videojuego"}
      </button>

      {editando && (
        <button type="button" className="admin-cancel-button" onClick={onCancelar}>
          Cancelar edición
        </button>
      )}
    </form>
  );
}
