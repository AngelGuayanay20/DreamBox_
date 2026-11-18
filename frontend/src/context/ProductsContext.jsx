import { createContext, useCallback, useContext, useState } from "react";
import { API_URL, fetchConTimeout } from "../services/api";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetchConTimeout(API_URL + "/api/productos");
      if (!respuesta.ok) throw new Error("Respuesta no válida");
      setProductos(await respuesta.json());
      setError(false);
      return true;
    } catch {
      setProductos([]);
      setError(true);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  return (
    <ProductsContext.Provider value={{ productos, error, cargando, cargarProductos }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProductos = () => useContext(ProductsContext);
