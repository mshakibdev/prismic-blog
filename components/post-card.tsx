import Link from "next/link";
import { asText, isFilled, type Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { authorData, categoryData } from "@/lib/blog";
import { formatDate } from "@/lib/site";

export function PostCard({
  post,
  featured = false,
}: {
  post: Content.BlogPostDocument;
  featured?: boolean;
}) {
  const author = authorData(post);
  const category = categoryData(post);
  return (
    <article className={`post-card ${featured ? "featured-card" : ""}`}>
      <Link
        href={`/blog/${post.uid}`}
        className="card-image-link"
        aria-label={asText(post.data.title) || "Read article"}
      >
        {isFilled.image(post.data.featured_image) ? (
          <PrismicNextImage
            field={post.data.featured_image}
            className="card-image"
            sizes={
              featured
                ? "(max-width: 800px) 100vw, 60vw"
                : "(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
            }
            preload={featured}
          />
        ) : (
          <div className="image-placeholder" aria-hidden="true">
            <span className="placeholder-lines">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </Link>
      <div className="card-content">
        <div className="card-meta">
          {category?.name && (
            <span className="category-label">{category.name}</span>
          )}
          <span>
            {formatDate(post.data.publish_date || post.first_publication_date)}
          </span>
        </div>
        <h2>
          <Link href={`/blog/${post.uid}`}>
            {asText(post.data.title) || "Untitled article"}
          </Link>
        </h2>
        {post.data.excerpt && (
          <p className="card-excerpt">{post.data.excerpt}</p>
        )}
        <div className="card-bottom">
          <span>{author?.name || "Editorial team"}</span>
          <Link
            href={`/blog/${post.uid}`}
            aria-label={`Read ${asText(post.data.title)}`}
            className="arrow-link"
          >
            ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
