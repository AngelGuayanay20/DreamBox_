import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import AdminRoute from "./components/AdminRoute";
import ScrollManager from "./components/ScrollManager";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/detalle/:id" element={<Detail />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Chatbot />
    </>
  );
}
