export const siteName = "Liberté Ministries";
export const contactEmail = "arvy@liberteministries.org";
export const facebook = "https://www.facebook.com/liberteministries/";

export function url(path = "") {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function localizeHtml(html: string) {
  return html.replace(
    /\b(href|src)="\/(?!\/)([^"]*)"/g,
    (_, attr, path) => `${attr}="${url(path)}"`,
  );
}

export const navigation = [
  { label: "Home", path: "" },
  { label: "About", path: "about/" },
  { label: "Ministries", path: "ministries/" },
  { label: "Trips", path: "trips/" },
  { label: "News", path: "blog/" },
];

export const aboutLinks = [
  { label: "Who We Are", path: "about/who-we-are/" },
  { label: "Why Haiti", path: "about/why-haiti/" },
  { label: "Why Us", path: "about/why-us/" },
  { label: "Mobilize Your Church", path: "about/mobilize-your-church/" },
];

export const ministryLinks = [
  { label: "Harry’s Home", path: "ministries/harrys-home/" },
  { label: "Haiti School of Biblical Studies", path: "ministries/hsbs/" },
  { label: "Bonnette Primary School", path: "ministries/school/" },
];
