import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://willinghamdigital.github.io",
  base: process.env.SITE_BASE ?? "/liberteministries.org",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
});
