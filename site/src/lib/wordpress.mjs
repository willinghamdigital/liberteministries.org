import { parseFragment, serialize } from "parse5";
import bundle from "../data/wordpress-styles.json";
import { url } from "./links";

const attrs = (node) =>
  Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
const walk = (node) => [node, ...(node.childNodes || []).flatMap(walk)];
const set = (node, name, value) => {
  const attr = node.attrs.find((a) => a.name === name);
  if (attr) attr.value = value;
  else node.attrs.push({ name, value });
};

export function rewriteUrl(value) {
  if (value.startsWith("/documents/"))
    return url(value.replace("/documents/", "/wp-content/uploads/2023/01/"));
  if (value.includes("#elementor-action")) return "#mobile-menu";
  if (value.startsWith("#") || /^(mailto:|tel:|data:)/i.test(value))
    return value;
  const plain = value.replace(/&amp;/g, "&");
  const mapped = bundle.urlMap[plain] || bundle.urlMap[plain.split("?")[0]];
  if (mapped) return url(mapped);
  if (/^https?:\/\/(next\.|www\.)?liberteministries\.org\//.test(plain)) {
    const parsed = new URL(plain);
    const asset =
      bundle.urlMap[`https://liberteministries.org${parsed.pathname}`];
    return url(asset || `${parsed.pathname}${parsed.hash}`);
  }
  if (/^\/\d{4}\/\d{2}\/\d{2}\/$/.test(value)) return url("blog/");
  return value.startsWith("/") && !value.startsWith("//") ? url(value) : value;
}

// Keep the exported layout intact; only URLs and static interaction hooks change.
export function renderWordpress(html, currentPath = "") {
  const tree = parseFragment(html);
  for (const node of walk(tree)) {
    if (!node.attrs) continue;
    const a = attrs(node);
    for (const attr of node.attrs) {
      if (["href", "src", "poster", "data-lazy-src"].includes(attr.name))
        attr.value = rewriteUrl(attr.value);
      if (attr.name === "srcset")
        attr.value = attr.value
          .split(",")
          .map((source) => {
            const [src, ...size] = source.trim().split(/\s+/);
            return [rewriteUrl(src), ...size].join(" ");
          })
          .join(", ");
      if (attr.name === "style")
        attr.value = attr.value.replace(
          /url\(["']?([^"')]+)["']?\)/g,
          (_, value) => `url("${rewriteUrl(value)}")`,
        );
    }
    if (a.href?.includes("#elementor-action")) {
      set(node, "aria-label", "Open menu");
      set(node, "aria-controls", "mobile-menu");
      set(node, "aria-expanded", "false");
    }
    if (node.tagName === "nav")
      node.attrs = node.attrs.filter((attr) => attr.name !== "aria-hidden");
    if (node.tagName === "a" && /elementor-(sub-)?item/.test(a.class || "")) {
      node.attrs = node.attrs.filter(
        (attr) => !["tabindex", "aria-current"].includes(attr.name),
      );
      const classes = a.class.replace(/\belementor-item-active\b/g, "").trim();
      set(node, "class", classes);
      if (attrs(node).href === url(currentPath)) {
        set(node, "aria-current", "page");
        set(node, "class", `${classes} elementor-item-active`);
      }
    }
    if ((a.class || "").includes("menu-item-has-children")) {
      const anchor = node.childNodes.find((n) => n.tagName === "a");
      if (anchor)
        anchor.childNodes.push(
          ...parseFragment(
            '<span class="sub-arrow" aria-hidden="true"><i class="fas fa-angle-down"></i></span>',
          ).childNodes,
        );
    }
    if (
      (a.class || "").includes("pp-accordion-tab-content") &&
      a["data-tab"] === "1"
    ) {
      node.childNodes = parseFragment(
        "<p>Our work is under the sponsorship and supervision of the elders of Petersville Church of Christ in Florence, Alabama.</p>",
      ).childNodes;
    }
    if ((a.class || "").includes("pp-accordion-tab-title"))
      set(node, "role", "button");
  }
  return serialize(tree);
}
