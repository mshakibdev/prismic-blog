import { Content } from "@prismicio/client";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

export default function Quote({
  slice,
}: SliceComponentProps<Content.QuoteSlice>) {
  return (
    <figure
      className="article-block slice-quote"
      data-slice-type={slice.slice_type}
    >
      <span aria-hidden="true" className="quote-mark">
        “
      </span>
      <blockquote>
        <PrismicRichText field={slice.primary.quote} />
      </blockquote>
      {slice.primary.attribution && (
        <figcaption>— {slice.primary.attribution}</figcaption>
      )}
    </figure>
  );
}
