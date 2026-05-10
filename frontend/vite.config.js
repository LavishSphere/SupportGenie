import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `base` matters for GitHub Pages.
// - Custom domain (e.g. uniplex.xyz CNAME):     base: "/"
// - Project page (https://<user>.github.io/<repo>/): base: "/<repo>/"
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
});
