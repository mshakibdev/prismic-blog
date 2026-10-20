import Link from "next/link";
import { asText } from "@prismicio/client";
import { getCategories, getListing, getSettings } from "@/lib/blog";
import { PostCard } from "@/components/post-card";

type Query = {
  page?: string | string[];
  category?: string | string[];
  q?: string | string[];
};
const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

export function blogUrl(
  base: string,
  { page, category, q }: { page?: string; category?: string; q?: string },
) {
  const params = new URLSearchParams();
  if (page && page !== "1") params.set("page", page);
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  return `${base}${params.size ? `?${params}` : ""}`;
}

export async function BlogIndex({
  searchParams,
  base = "/blog",
}: {
  searchParams: Promise<Query>;
  base?: string;
}) {
  const params = await searchParams;
  const parsedPage = Number(firstValue(params.page));
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, 10000)
      : 1;
  const query = firstValue(params.q).trim().slice(0, 150);
  const category = firstValue(params.category).slice(0, 100);
  const [listing, categories, settings] = await Promise.all([
    getListing(page, category, query),
    getCategories(),
    getSettings(),
  ]);
  const isFiltered = Boolean(query || category || page > 1);
  const lead = !isFiltered
    ? listing.posts.find((post) => post.data.featured) || listing.posts[0]
    : undefined;
  const remaining = listing.posts.filter((post) => post.id !== lead?.id);
  return (
    <main id="main-content" className="journal-main">
      <section className="journal-intro">
        <div className="eyebrow">
          <span className="status-dot" />
          {settings?.data.eyebrow || "THE TINYFLOW JOURNAL"}
        </div>
        <div className="intro-row">
          <h1>
            {asText(settings?.data.intro_title) || "A fresh perspective."}
          </h1>
          <p>
            {settings?.data.intro_description ||
              "Thoughtful ideas, practical insights, and stories for the curious. Take a moment. Find something that moves you forward."}
          </p>
        </div>
        <div className="intro-rule">
          <span>GOOD IDEAS START HERE</span>
          <span aria-hidden="true">↓</span>
        </div>
      </section>
      {lead && (
        <section className="featured-section" aria-label="Featured story">
          <div className="section-kicker">IN THE SPOTLIGHT</div>
          <PostCard post={lead} featured />
        </section>
      )}
      <section className="stories-section" aria-labelledby="stories-heading">
        <div className="section-heading">
          <h2 id="stories-heading">
            {isFiltered ? "Explore stories" : "The latest"}
            <span className="count">
              {listing.total.toString().padStart(2, "0")}
            </span>
          </h2>
          <p>Something new to think about.</p>
        </div>
        <div className="filter-bar">
          <nav className="category-nav" aria-label="Filter by category">
            <Link
              className={`filter-chip ${!category ? "active" : ""}`}
              href={blogUrl(base, { q: query })}
              aria-current={!category ? "page" : undefined}
            >
              All stories
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={blogUrl(base, { category: item.id, q: query })}
                className={`filter-chip ${category === item.id ? "active" : ""}`}
                aria-current={category === item.id ? "page" : undefined}
              >
                {item.data.name || item.uid}
              </Link>
            ))}
          </nav>
          <form action={base} className="search-form" role="search">
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <label className="sr-only" htmlFor="story-search">
              Search stories
            </label>
            <input
              id="story-search"
              name="q"
              type="search"
              placeholder="Find a story…"
              defaultValue={query}
              maxLength={150}
            />
            <button type="submit" aria-label="Search stories">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
            </button>
          </form>
        </div>
        {query && (
          <p className="search-summary">
            Results for “{query}”{" "}
            <Link href={blogUrl(base, { category })}>Clear search</Link>
          </p>
        )}
        {remaining.length ? (
          <div className="post-grid">
            {remaining.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : lead ? (
          <p className="quiet-note">More stories are on their way.</p>
        ) : (
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">
              ✳
            </span>
            <h3>
              {isFiltered
                ? "No stories found."
                : "The first story is on its way."}
            </h3>
            <p>
              {isFiltered
                ? "Try a different search or explore all stories."
                : "There’s always something worth sharing. Check back soon for new ideas and fresh perspectives."}
            </p>
            {isFiltered && (
              <Link className="text-link" href={base}>
                Explore all stories ↗
              </Link>
            )}
          </div>
        )}
        {listing.totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={blogUrl(base, {
                  page: String(page - 1),
                  category,
                  q: query,
                })}
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span>
              Page {page} of {listing.totalPages}
            </span>
            {page < listing.totalPages ? (
              <Link
                href={blogUrl(base, {
                  page: String(page + 1),
                  category,
                  q: query,
                })}
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
      <aside className="editorial-note">
        <span className="note-mark" aria-hidden="true">
          ✳
        </span>
        <div>
          <p className="eyebrow">STAY CURIOUS</p>
          <h2>
            Small ideas.
            <br />A bigger perspective.
          </h2>
        </div>
        <p>
          Make room for a good read.
          <br />
          We’ll keep the ideas flowing.
        </p>
      </aside>
    </main>
  );
}
