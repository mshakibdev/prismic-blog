import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asText, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import {
  authorData,
  categoryData,
  getPost,
  getRelated,
  getSettings,
} from "@/lib/blog";
import {
  absoluteUrl,
  canIndex,
  formatDate,
  serializeJsonLd,
  site,
} from "@/lib/site";
import { PostCard } from "@/components/post-card";
import { components } from "@/slices";
import { getPreviewRef } from "@prismicio/next";
import { Suspense } from "react";
import Loading from "@/app/loading";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[uid]">): Promise<Metadata> {
  const { uid } = await params;
  const [post, settings, previewRef] = await Promise.all([
    getPost(uid),
    getSettings(),
    getPreviewRef(),
  ]);
  if (!post) notFound();
  const title =
    post.data.meta_title || asText(post.data.title) || "Untitled article";
  const description =
    post.data.meta_description || post.data.excerpt || undefined;
  const image =
    post.data.meta_image.url ||
    post.data.featured_image.url ||
    settings?.data.meta_image.url ||
    absoluteUrl("/share-image");
  const path = `/blog/${uid}`;
  const author = authorData(post);
  return {
    title: { absolute: `${title} | ${settings?.data.site_name || site.name}` },
    description,
    alternates: { canonical: path },
    robots: { index: canIndex && !previewRef, follow: canIndex && !previewRef },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "article",
      publishedTime:
        post.data.publish_date || post.first_publication_date || undefined,
      modifiedTime: post.last_publication_date || undefined,
      authors: author?.name ? [author.name] : undefined,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function Article(props: PageProps<"/blog/[uid]">) {
  return (
    <Suspense fallback={<Loading />}>
      <ArticleContent {...props} />
    </Suspense>
  );
}

async function ArticleContent({ params }: PageProps<"/blog/[uid]">) {
  const { uid } = await params;
  const post = await getPost(uid);
  if (!post) notFound();
  const category = categoryData(post);
  const author = authorData(post);
  const categoryId = isFilled.contentRelationship(post.data.category)
    ? post.data.category.id
    : "";
  const [related, settings] = await Promise.all([
    getRelated(post.id, categoryId),
    getSettings(),
  ]);
  const title = asText(post.data.title) || "Untitled article";
  const publicationDate = post.data.publish_date || post.first_publication_date;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: post.data.meta_description || post.data.excerpt || undefined,
    image: post.data.featured_image.url
      ? [post.data.featured_image.url]
      : undefined,
    datePublished: publicationDate || undefined,
    dateModified: post.last_publication_date || undefined,
    author: author?.name ? { "@type": "Person", name: author.name } : undefined,
    publisher: {
      "@type": "Organization",
      name: settings?.data.site_name || site.name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${uid}`),
    },
  };
  return (
    <main id="main-content" className="journal-main article-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Link href="/blog" className="back-link">
        ← Back to the journal
      </Link>
      <article>
        <header className="article-heading">
          <div className="card-meta">
            {category?.name && (
              <Link
                className="category-label"
                href={`/blog?category=${categoryId}`}
              >
                {category.name}
              </Link>
            )}
            {publicationDate && (
              <time dateTime={publicationDate}>
                {formatDate(publicationDate)}
              </time>
            )}
          </div>
          <h1>{title}</h1>
          {post.data.excerpt && (
            <p className="article-excerpt">{post.data.excerpt}</p>
          )}
          {author?.name && (
            <div className="article-byline">
              {isFilled.image(author.avatar) && (
                <PrismicNextImage
                  field={author.avatar}
                  width={42}
                  height={42}
                  className="avatar"
                />
              )}
              <span>
                By <strong>{author.name}</strong>
              </span>
            </div>
          )}
        </header>
        {isFilled.image(post.data.featured_image) && (
          <PrismicNextImage
            field={post.data.featured_image}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="article-cover"
            preload
          />
        )}
        <div className="article-body">
          <SliceZone slices={post.data.slices} components={components} />
        </div>
        {author?.name && isFilled.richText(author.bio) && (
          <aside className="author-bio">
            <p className="eyebrow">ABOUT THE AUTHOR</p>
            <h2>{author.name}</h2>
            <div className="prose">
              <PrismicRichText field={author.bio} />
            </div>
          </aside>
        )}
      </article>
      {related.length > 0 && (
        <section className="related-posts" aria-labelledby="related-heading">
          <div className="section-heading">
            <h2 id="related-heading">Keep exploring</h2>
            <Link href="/blog">All stories ↗</Link>
          </div>
          <div className="post-grid">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
