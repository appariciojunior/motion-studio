import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: ".",
  define: {
    __APP_DISPLAY_NAME__: JSON.stringify("Motion Studio"),
  },
  resolve: {
    alias: {
      "@renderer": path.resolve(__dirname, "renderer"),
      "@shared": path.resolve(__dirname, "renderer/shared"),
      "@glaze/core/components": path.resolve(__dirname, "renderer/shims/components.tsx"),
      "@glaze/core/hooks": path.resolve(__dirname, "renderer/shims/hooks.ts"),
      "@glaze/core/utils": path.resolve(__dirname, "renderer/shims/utils.ts"),
      "@glaze/core/ipc": path.resolve(__dirname, "renderer/shims/ipc.ts"),
      "@glaze/core/preload": path.resolve(__dirname, "renderer/shims/ipc.ts"),
      // Redirect the Glaze-managed styles.css to our web-friendly version (with Tailwind import)
      "renderer/styles.css": path.resolve(__dirname, "renderer/web-styles.css"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist-web",
    rollupOptions: {
      input: { main: path.resolve(__dirname, "index.html") },
    },
  },
});
