import { Content } from "@prismicio/client";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

export default function RichText({
  slice,
}: SliceComponentProps<Content.RichTextSlice>) {
  return (
    <section className="article-block prose" data-slice-type={slice.slice_type}>
      <PrismicRichText field={slice.primary.content} />
    </section>
  );
}
