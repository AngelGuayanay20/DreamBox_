import { useState } from "react";

export default function PasswordInput({ id, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-wrapper">
      <input id={id} type={visible ? "text" : "password"} {...props} />
      <button
        type="button"
        className="toggle-password"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
