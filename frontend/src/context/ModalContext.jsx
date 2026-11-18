import { createContext, useCallback, useContext, useRef, useState } from "react";

const ModalContext = createContext(null);

// mostrarModal(mensaje, esConfirmacion) devuelve una Promise, igual que en el script original.
export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const resolverActual = useRef(null);

  const mostrarModal = useCallback((mensaje, esConfirmacion = false) => {
    resolverActual.current?.(false);
    return new Promise((resolve) => {
      resolverActual.current = resolve;
      setModal({ mensaje, esConfirmacion });
    });
  }, []);

  function cerrar(valor) {
    resolverActual.current?.(valor);
    resolverActual.current = null;
    setModal(null);
  }

  return (
    <ModalContext.Provider value={mostrarModal}>
      {children}
      {modal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" role="dialog" aria-modal="true">
            <p>{modal.mensaje}</p>
            <div className="custom-modal-buttons">
              {modal.esConfirmacion && (
                <button className="btn-modal-cancelar" onClick={() => cerrar(false)}>
                  Cancelar
                </button>
              )}
              <button className="btn-modal-aceptar" onClick={() => cerrar(true)} autoFocus>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
