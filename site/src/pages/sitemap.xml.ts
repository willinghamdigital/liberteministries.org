import wordpress from "../data/wordpress.json";
import posts from "../data/wordpress-posts.json";
import { url } from "../lib/links";
export const prerender = true;
export function GET({ site }: { site: URL }) {
  const paths = [
    "",
    "blog/",
    ...wordpress.pages.map((p) => p.path),
    ...posts.pages.map((p) => p.path),
  ];
  const entries = [...new Set(paths)]
    .map((path) => `<url><loc>${new URL(url(path), site).href}</loc></url>`)
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
