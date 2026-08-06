// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Build as a client-only SPA (disable server entry / SSR build).
// This switches TanStack Start into a static SPA export mode so the
// Vite build produces only client HTML/JS/CSS assets.
export default defineConfig({
  tanstackStart: {
    // Use SPA export mode so no server entry is bundled.
    // 'spa' produces a client-side single-page application suitable for PWA installs.
    exportMode: "spa",
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
