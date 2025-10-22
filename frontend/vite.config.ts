import react from "@vitejs/plugin-react-swc";
import { configDefaults, defineConfig as defineVitestConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineVitestConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    exclude: [...configDefaults.exclude, "e2e/*"],
  },
});
