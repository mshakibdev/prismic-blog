import "server-only";
import { cache } from "react";
import { Content, NotFoundError, filter } from "@prismicio/client";
import { cacheLife, cacheTag } from "next/cache";
import { getPreviewRef } from "@prismicio/next";
import { createContentClient } from "@/prismicio";

const fetchLinks = [
  "author.name",
  "author.avatar",
  "author.bio",
  "category.name",
  "category.description",
];
const cacheDuration =
  process.env.NODE_ENV === "production"
    ? { stale: 60, revalidate: 300, expire: 3600 }
    : { stale: 0, revalidate: 5, expire: 60 };
export const PAGE_SIZE = 9;

async function fetchListing(
  page: number,
  category: string,
  query: string,
  ref?: string,
) {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const repository = await client.getRepository();
  if (!repository.types.blog_post && !ref)
    return { posts: [], page: 1, totalPages: 0, total: 0 };
  const response = await client.getByType("blog_post", {
    ref,
    page,
    pageSize: PAGE_SIZE,
    fetchLinks,
    orderings: [
      { field: "my.blog_post.publish_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
    filters: [
      ...(category ? [filter.at("my.blog_post.category", category)] : []),
      ...(query ? [filter.fulltext("document", query)] : []),
    ],
  });
  return {
    posts: response.results,
    page: response.page,
    totalPages: response.total_pages,
    total: response.total_results_size,
  };
}

async function fetchPost(uid: string, ref?: string) {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const repository = await client.getRepository();
  if (!repository.types.blog_post && !ref) return null;
  try {
    return await client.getByUID("blog_post", uid, { ref, fetchLinks });
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

async function fetchCategories(ref?: string) {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const repository = await client.getRepository();
  if (!repository.types.category && !ref) return [];
  return client.getAllByType("category", {
    ref,
    orderings: [{ field: "my.category.name", direction: "asc" }],
  });
}

async function fetchSettings(ref?: string) {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const repository = await client.getRepository();
  if (!repository.types.site_settings && !ref) return null;
  try {
    return await client.getSingle("site_settings", { ref });
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

async function fetchRelated(postId: string, category: string, ref?: string) {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const options = {
    ref,
    pageSize: 3,
    fetchLinks,
    orderings: [
      { field: "my.blog_post.publish_date", direction: "desc" as const },
    ],
  };
  const filters = [filter.not("document.id", postId)];
  if (category) {
    const related = await client.getByType("blog_post", {
      ...options,
      filters: [...filters, filter.at("my.blog_post.category", category)],
    });
    if (related.results.length) return related.results;
  }
  return (await client.getByType("blog_post", { ...options, filters })).results;
}

/** Sitemap always reads published content, even during a preview session. */
export async function getSitemapPosts() {
  "use cache";
  cacheTag("prismic");
  cacheLife(cacheDuration);
  const client = createContentClient();
  const repository = await client.getRepository();
  if (!repository.types.blog_post) return [];
  return client.getAllByType("blog_post");
}

export const getListing = cache(async (page = 1, category = "", query = "") =>
  fetchListing(page, category, query, await getPreviewRef()),
);
export const getPost = cache(async (uid: string) =>
  fetchPost(uid, await getPreviewRef()),
);
export const getCategories = cache(async () =>
  fetchCategories(await getPreviewRef()),
);
export const getSettings = cache(async () =>
  fetchSettings(await getPreviewRef()),
);
export const getRelated = cache(async (id: string, category: string) =>
  fetchRelated(id, category, await getPreviewRef()),
);

export function authorData(post: Content.BlogPostDocument) {
  const field = post.data.author;
  return field && "data" in field ? field.data : undefined;
}

export function categoryData(post: Content.BlogPostDocument) {
  const field = post.data.category;
  return field && "data" in field ? field.data : undefined;
}
