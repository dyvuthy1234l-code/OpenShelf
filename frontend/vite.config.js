import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],

  // Vite serves locally from the domain root, while GitHub Pages serves the
  // production build from the repository subpath.
  base: command === "serve" ? "/" : "/Front--OpenShelf/",

  // Local development only
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
