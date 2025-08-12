import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/chainforge/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@redux": path.resolve(__dirname, "./src/redux"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  define: {
    global: "globalThis",
    "process.env": process.env,
  },
  server: {
    port: 3006,
    open: true,
    middlewareMode: false,
    fs: { strict: false },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS options if needed
      },
    },
  },
  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "stream-browserify",
      "util",
      "crypto-browserify",
      "vm-browserify",
    ],
  },
});
