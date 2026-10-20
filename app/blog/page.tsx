import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog-index";
import { getSettings } from "@/lib/blog";
import { absoluteUrl, canIndex, site } from "@/lib/site";
import { getPreviewRef } from "@prismicio/next";
import { Suspense } from "react";
import Loading from "@/app/loading";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, previewRef] = await Promise.all([
    getSettings(),
    getPreviewRef(),
  ]);
  const title = `The journal | ${settings?.data.site_name || site.name}`;
  const description = settings?.data.description || site.description;
  const image = settings?.data.meta_image.url || absoluteUrl("/share-image");
  return {
    title: { absolute: title },
    description,
    robots: { index: canIndex && !previewRef, follow: canIndex && !previewRef },
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      url: "/blog",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function Blog(props: PageProps<"/blog">) {
  return (
    <Suspense fallback={<Loading />}>
      <BlogIndex searchParams={props.searchParams} />
    </Suspense>
  );
}
