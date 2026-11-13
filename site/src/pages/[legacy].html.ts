import { url } from "../lib/links";

export function getStaticPaths() {
  return [
    { legacy: "give", target: "donations/" },
    { legacy: "contact", target: "#contact" },
    { legacy: "go", target: "trips/" },
  ].map(({ legacy, target }) => ({ params: { legacy }, props: { target } }));
}

export function GET({ props }: { props: { target: string } }) {
  const target = url(props.target);
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page moved | Liberté Ministries</title><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>This page has moved. <a href="${target}">Continue to Liberté Ministries</a>.</p></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
