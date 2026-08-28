import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  const basePath = process.env.VITE_BASE_PATH || (isBuild ? "/Front_OpenShelf/" : "/");

  return {
    plugins: [react(), tailwindcss()],
    base: basePath,
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
  };
});
