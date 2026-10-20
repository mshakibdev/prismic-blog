import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";

export default function Image({
  slice,
}: SliceComponentProps<Content.ImageSlice>) {
  if (!isFilled.image(slice.primary.image)) return null;
  return (
    <figure
      className="article-block slice-image"
      data-slice-type={slice.slice_type}
    >
      <PrismicNextImage
        field={slice.primary.image}
        sizes="(max-width: 900px) 100vw, 800px"
        className="article-image"
      />
      {slice.primary.caption && (
        <figcaption>{slice.primary.caption}</figcaption>
      )}
    </figure>
  );
}
