import { asText, isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

export default function CallToAction({
  slice,
}: SliceComponentProps<Content.CallToActionSlice>) {
  return (
    <aside
      className="article-block slice-cta"
      data-slice-type={slice.slice_type}
    >
      <h2>{asText(slice.primary.heading)}</h2>
      <div className="prose">
        <PrismicRichText field={slice.primary.description} />
      </div>
      {isFilled.link(slice.primary.link) && (
        <PrismicNextLink field={slice.primary.link} className="button">
          {slice.primary.button_label ||
            slice.primary.link.text ||
            "Learn more"}{" "}
          <span aria-hidden="true">↗</span>
        </PrismicNextLink>
      )}
    </aside>
  );
}
