import type { MetadataRoute } from "next";
import { getSitemapPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSitemapPosts();
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.uid}`),
      lastModified: post.last_publication_date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
