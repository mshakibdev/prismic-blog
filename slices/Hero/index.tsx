import { asText, isFilled, type Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

export default function Hero({
  slice,
}: SliceComponentProps<Content.HeroSlice>) {
  return (
    <section
      className="article-block slice-hero"
      data-slice-type={slice.slice_type}
    >
      {isFilled.richText(slice.primary.heading) && (
        <h2>{asText(slice.primary.heading)}</h2>
      )}
      <div className="prose">
        <PrismicRichText field={slice.primary.description} />
      </div>
      {isFilled.image(slice.primary.image) && (
        <PrismicNextImage
          field={slice.primary.image}
          sizes="(max-width: 900px) 100vw, 800px"
          className="article-image"
        />
      )}
    </section>
  );
}
