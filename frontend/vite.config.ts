import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, `${process.cwd()}/.`);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL, // AUDIT-023: was VITE_BACKEND_API_URL, which is never set anywhere
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
