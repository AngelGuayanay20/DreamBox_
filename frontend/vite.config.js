import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" permite publicar en GitHub Pages (subcarpeta /DreamBox_/) sin cambios.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
