import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ModalProvider } from "./context/ModalContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductsProvider } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";
import "./styles/global.css";

// HashRouter: funciona en GitHub Pages sin configurar redirecciones (#/catalogo, #/admin...).
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <ModalProvider>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </ModalProvider>
    </HashRouter>
  </StrictMode>
);
