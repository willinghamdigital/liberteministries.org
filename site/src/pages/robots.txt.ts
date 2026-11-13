import { url } from "../lib/links";
export const prerender = true;
export function GET({ site }: { site: URL }) {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL(url("sitemap.xml"), site).href}\n`,
  );
}
