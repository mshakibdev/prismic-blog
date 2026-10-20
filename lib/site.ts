const configuredUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const site = {
  name: "Tinyflow Journal",
  description: "Ideas, stories, and perspectives worth your time.",
  url: new URL(configuredUrl).origin,
};

export const canIndex =
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL_ENV !== "preview" &&
  !["localhost", "127.0.0.1"].includes(new URL(site.url).hostname) &&
  process.env.DISABLE_INDEXING !== "true";

export function absoluteUrl(path: string) {
  return new URL(path, `${site.url}/`).toString();
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
