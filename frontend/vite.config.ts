import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { configDefaults, defineConfig as defineVitestConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineVitestConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@providers": fileURLToPath(new URL("./src/providers", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    exclude: [...configDefaults.exclude, "e2e/*"],
  },
});
