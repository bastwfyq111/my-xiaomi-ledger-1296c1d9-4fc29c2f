import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Standard Vite SPA configuration for TanStack Router
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
  },
});
