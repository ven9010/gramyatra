import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Proxying API requests to the backend server
      "/api": "http://localhost:8000",
    },
  },
  plugins: [react()],
});
