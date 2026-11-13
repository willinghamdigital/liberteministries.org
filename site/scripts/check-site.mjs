import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";
import config from "../astro.config.mjs";

const root = path.resolve("dist");
const origin = new URL(config.site).origin;
const base = `/${String(config.base).replace(/^\/+|\/+$/g, "")}`.replace(
  /^\/$/,
  "",
);
const failures = [];
const documents = new Map();

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesIn(file) : [file];
    }),
  );
  return nested.flat();
}

function nodesIn(node) {
  return [node, ...(node.childNodes || []).flatMap(nodesIn)];
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

const files = await filesIn(root);
for (const file of files.filter((file) => file.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  const nodes = nodesIn(parse(html));
  documents.set(file, {
    nodes,
    ids: new Set(nodes.map((node) => attribute(node, "id")).filter(Boolean)),
  });
  const label = path.relative(root, file);
  if (!nodes.some((node) => node.tagName === "title")) {
    failures.push(`${label}: missing page title`);
  }
  if (
    !nodes.some((node) => node.tagName === "html" && attribute(node, "lang"))
  ) {
    failures.push(`${label}: missing document language`);
  }
  if (/next\.liberteministries\.org|wp-json|wp-admin|wp-includes/.test(html)) {
    failures.push(`${label}: still depends on the old WordPress site`);
  }
  for (const node of nodes) {
    if (node.tagName === "form") {
      const action = attribute(node, "action");
      if (!action || action.startsWith("#")) {
        failures.push(`${label}: form has no working submission destination`);
      }
    }
    if (node.tagName === "img" && attribute(node, "alt") === undefined) {
      failures.push(`${label}: image is missing an alt attribute`);
    }
  }
}

async function checkReference(value, file, checkAnchor = false) {
  if (!value || /^(mailto:|tel:|data:|javascript:)/i.test(value)) return;
  const label = path.relative(root, file);
  const pagePath = `${base}/${label.replace(/index\.html$/, "")}`;
  let url;
  try {
    url = new URL(value, `${origin}${pagePath}`);
  } catch {
    failures.push(`${label}: invalid URL ${value}`);
    return;
  }
  if (url.origin !== origin) return;
  let pathname = decodeURIComponent(url.pathname);
  if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
    failures.push(`${label}: URL omits the configured base path: ${value}`);
    return;
  }
  pathname = pathname.slice(base.length).replace(/^\/+/, "");
  let target = path.resolve(root, pathname);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    failures.push(`${label}: URL escapes the build directory: ${value}`);
    return;
  }
  try {
    if ((await stat(target)).isDirectory())
      target = path.join(target, "index.html");
    await stat(target);
  } catch {
    failures.push(`${label}: missing local target ${value}`);
    return;
  }
  if (checkAnchor && url.hash && documents.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    if (!documents.get(target).ids.has(id)) {
      failures.push(`${label}: missing anchor ${value}`);
    }
  }
}

for (const [file, { nodes }] of documents) {
  for (const node of nodes) {
    for (const name of ["href", "src", "poster"]) {
      const value = attribute(node, name);
      if (value) await checkReference(value, file, name === "href");
    }
    const srcset = attribute(node, "srcset");
    if (srcset && !srcset.startsWith("data:")) {
      for (const source of srcset.split(",")) {
        await checkReference(source.trim().split(/\s+/)[0], file);
      }
    }
    const inlineStyle = attribute(node, "style") || "";
    for (const match of inlineStyle.matchAll(
      /url\(\s*["']?([^"'()\s]+)["']?\s*\)/g,
    )) {
      await checkReference(match[1], file);
    }
  }
}

for (const file of files.filter((file) => file.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"'()\s]+)["']?\s*\)/g)) {
    await checkReference(match[1], file);
  }
}

if (!documents.has(path.join(root, "index.html"))) {
  failures.push("The build has no homepage.");
}
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exit(1);
}
console.log(
  `Validated ${documents.size} static pages: local links, anchors, images, styles, and forms.`,
);
