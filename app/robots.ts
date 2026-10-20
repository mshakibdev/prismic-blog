import type { MetadataRoute } from "next";
import { absoluteUrl, canIndex } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: canIndex
      ? { userAgent: "*", allow: "/", disallow: ["/api/", "/slice-simulator"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
