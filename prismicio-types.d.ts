import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

type PickContentRelationshipFieldData<
  TRelationship extends
    | prismic.CustomTypeModelFetchCustomTypeLevel1
    | prismic.CustomTypeModelFetchCustomTypeLevel2
    | prismic.CustomTypeModelFetchGroupLevel1
    | prismic.CustomTypeModelFetchGroupLevel2,
  TData extends Record<
    string,
    | prismic.AnyRegularField
    | prismic.GroupField
    | prismic.NestedGroupField
    | prismic.SliceZone
  >,
  TLang extends string,
> =
  // Content relationship fields
  {
    [
      TSubRelationship in Extract<
        TRelationship["fields"][number],
        prismic.CustomTypeModelFetchContentRelationshipLevel1
      > as TSubRelationship["id"]
    ]: ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
  } & // Group
  {
    [
      TGroup in Extract<
        TRelationship["fields"][number],
        | prismic.CustomTypeModelFetchGroupLevel1
        | prismic.CustomTypeModelFetchGroupLevel2
      > as TGroup["id"]
    ]: TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
      ? prismic.GroupField<
          PickContentRelationshipFieldData<TGroup, TGroupData, TLang>
        >
      : never;
  } & // Other fields
  {
    [
      TFieldKey in Extract<TRelationship["fields"][number], string>
    ]: TFieldKey extends keyof TData ? TData[TFieldKey] : never;
  };

type ContentRelationshipFieldWithData<
  TCustomType extends
    | readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[]
    | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
  TLang extends string = string,
> = {
  [
    ID in Exclude<TCustomType[number], string>["id"]
  ]: prismic.ContentRelationshipField<
    ID,
    TLang,
    PickContentRelationshipFieldData<
      Extract<TCustomType[number], { id: ID }>,
      Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
      TLang
    >
  >;
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Content for Author documents
 */
interface AuthorDocumentData {
  /**
   * Name field in *Author*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: author.name
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  name: prismic.KeyTextField;

  /**
   * Portrait field in *Author*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: author.avatar
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  avatar: prismic.ImageField<never>;

  /**
   * Biography field in *Author*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: author.bio
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  bio: prismic.RichTextField;
}

/**
 * Author document from Prismic
 *
 * - **API ID**: `author`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AuthorDocument<Lang extends string = string> =
  prismic.PrismicDocumentWithUID<Simplify<AuthorDocumentData>, "author", Lang>;

type BlogPostDocumentDataSlicesSlice =
  HeroSlice | RichTextSlice | ImageSlice | QuoteSlice | CallToActionSlice;

/**
 * Content for Blog Post documents
 */
interface BlogPostDocumentData {
  /**
   * Title field in *Blog Post*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.title
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  title: prismic.RichTextField;

  /**
   * Featured image field in *Blog Post*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.featured_image
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  featured_image: prismic.ImageField<never>;

  /**
   * Excerpt field in *Blog Post*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.excerpt
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  excerpt: prismic.KeyTextField;

  /**
   * Author field in *Blog Post*
   *
   * - **Field Type**: Content Relationship
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.author
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/content-relationship
   */
  author: ContentRelationshipFieldWithData<
    [{ id: "author"; fields: ["name", "avatar", "bio"] }]
  >;

  /**
   * Category field in *Blog Post*
   *
   * - **Field Type**: Content Relationship
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.category
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/content-relationship
   */
  category: ContentRelationshipFieldWithData<
    [{ id: "category"; fields: ["name", "description"] }]
  >;

  /**
   * Publish date field in *Blog Post*
   *
   * - **Field Type**: Date
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.publish_date
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/date
   */
  publish_date: prismic.DateField;

  /**
   * Feature on the blog homepage field in *Blog Post*
   *
   * - **Field Type**: Boolean
   * - **Placeholder**: *None*
   * - **Default Value**: false
   * - **API ID Path**: blog_post.featured
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/boolean
   */
  featured: prismic.BooleanField;

  /**
   * Article content field in *Blog Post*
   *
   * - **Field Type**: Slice Zone
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.slices[]
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/slices
   */
  slices: prismic.SliceZone<BlogPostDocumentDataSlicesSlice>; /**
   * SEO title field in *Blog Post*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.meta_title
   * - **Tab**: SEO & Metadata
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  meta_title: prismic.KeyTextField;

  /**
   * SEO description field in *Blog Post*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.meta_description
   * - **Tab**: SEO & Metadata
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  meta_description: prismic.KeyTextField;

  /**
   * Social sharing image field in *Blog Post*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: blog_post.meta_image
   * - **Tab**: SEO & Metadata
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  meta_image: prismic.ImageField<never>;
}

/**
 * Blog Post document from Prismic
 *
 * - **API ID**: `blog_post`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type BlogPostDocument<Lang extends string = string> =
  prismic.PrismicDocumentWithUID<
    Simplify<BlogPostDocumentData>,
    "blog_post",
    Lang
  >;

/**
 * Content for Category documents
 */
interface CategoryDocumentData {
  /**
   * Name field in *Category*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: category.name
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  name: prismic.KeyTextField;

  /**
   * Description field in *Category*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: category.description
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  description: prismic.KeyTextField;
}

/**
 * Category document from Prismic
 *
 * - **API ID**: `category`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type CategoryDocument<Lang extends string = string> =
  prismic.PrismicDocumentWithUID<
    Simplify<CategoryDocumentData>,
    "category",
    Lang
  >;

/**
 * Content for Site Settings documents
 */
interface SiteSettingsDocumentData {
  /**
   * Site name field in *Site Settings*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.site_name
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  site_name: prismic.KeyTextField;

  /**
   * Site description field in *Site Settings*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.description
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  description: prismic.KeyTextField;

  /**
   * Homepage eyebrow field in *Site Settings*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.eyebrow
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  eyebrow: prismic.KeyTextField;

  /**
   * Homepage heading field in *Site Settings*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.intro_title
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  intro_title: prismic.RichTextField;

  /**
   * Homepage introduction field in *Site Settings*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.intro_description
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  intro_description: prismic.KeyTextField;

  /**
   * Footer text field in *Site Settings*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.footer_text
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  footer_text: prismic.KeyTextField;

  /**
   * Default social sharing image field in *Site Settings*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: site_settings.meta_image
   * - **Tab**: Main
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  meta_image: prismic.ImageField<never>;
}

/**
 * Site Settings document from Prismic
 *
 * - **API ID**: `site_settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SiteSettingsDocument<Lang extends string = string> =
  prismic.PrismicDocumentWithoutUID<
    Simplify<SiteSettingsDocumentData>,
    "site_settings",
    Lang
  >;

export type AllDocumentTypes =
  AuthorDocument | BlogPostDocument | CategoryDocument | SiteSettingsDocument;

/**
 * Primary content in *Call To Action → Default → Primary*
 */
export interface CallToActionSliceDefaultPrimary {
  /**
   * Heading field in *Call To Action → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: call_to_action.default.primary.heading
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  heading: prismic.RichTextField;

  /**
   * Description field in *Call To Action → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: call_to_action.default.primary.description
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  description: prismic.RichTextField;

  /**
   * Destination field in *Call To Action → Default → Primary*
   *
   * - **Field Type**: Link
   * - **Placeholder**: *None*
   * - **API ID Path**: call_to_action.default.primary.link
   * - **Documentation**: https://prismic.io/docs/fields/link
   */
  link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;

  /**
   * Button label field in *Call To Action → Default → Primary*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: call_to_action.default.primary.button_label
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  button_label: prismic.KeyTextField;
}

/**
 * Default variation for Call To Action Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CallToActionSliceDefault = prismic.SharedSliceVariation<
  "default",
  Simplify<CallToActionSliceDefaultPrimary>,
  never
>;

/**
 * Slice variation for *Call To Action*
 */
type CallToActionSliceVariation = CallToActionSliceDefault;

/**
 * Call To Action Shared Slice
 *
 * - **API ID**: `call_to_action`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CallToActionSlice = prismic.SharedSlice<
  "call_to_action",
  CallToActionSliceVariation
>;

/**
 * Primary content in *Hero → Default → Primary*
 */
export interface HeroSliceDefaultPrimary {
  /**
   * Section heading field in *Hero → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: hero.default.primary.heading
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  heading: prismic.RichTextField;

  /**
   * Introduction field in *Hero → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: hero.default.primary.description
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  description: prismic.RichTextField;

  /**
   * Image field in *Hero → Default → Primary*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: hero.default.primary.image
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  image: prismic.ImageField<never>;
}

/**
 * Default variation for Hero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceDefault = prismic.SharedSliceVariation<
  "default",
  Simplify<HeroSliceDefaultPrimary>,
  never
>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceDefault;

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Primary content in *Image → Default → Primary*
 */
export interface ImageSliceDefaultPrimary {
  /**
   * Image field in *Image → Default → Primary*
   *
   * - **Field Type**: Image
   * - **Placeholder**: *None*
   * - **API ID Path**: image.default.primary.image
   * - **Documentation**: https://prismic.io/docs/fields/image
   */
  image: prismic.ImageField<never>;

  /**
   * Caption field in *Image → Default → Primary*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: image.default.primary.caption
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  caption: prismic.KeyTextField;
}

/**
 * Default variation for Image Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageSliceDefault = prismic.SharedSliceVariation<
  "default",
  Simplify<ImageSliceDefaultPrimary>,
  never
>;

/**
 * Slice variation for *Image*
 */
type ImageSliceVariation = ImageSliceDefault;

/**
 * Image Shared Slice
 *
 * - **API ID**: `image`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageSlice = prismic.SharedSlice<"image", ImageSliceVariation>;

/**
 * Primary content in *Quote → Default → Primary*
 */
export interface QuoteSliceDefaultPrimary {
  /**
   * Quote field in *Quote → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: quote.default.primary.quote
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  quote: prismic.RichTextField;

  /**
   * Attribution field in *Quote → Default → Primary*
   *
   * - **Field Type**: Text
   * - **Placeholder**: *None*
   * - **API ID Path**: quote.default.primary.attribution
   * - **Documentation**: https://prismic.io/docs/fields/text
   */
  attribution: prismic.KeyTextField;
}

/**
 * Default variation for Quote Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type QuoteSliceDefault = prismic.SharedSliceVariation<
  "default",
  Simplify<QuoteSliceDefaultPrimary>,
  never
>;

/**
 * Slice variation for *Quote*
 */
type QuoteSliceVariation = QuoteSliceDefault;

/**
 * Quote Shared Slice
 *
 * - **API ID**: `quote`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type QuoteSlice = prismic.SharedSlice<"quote", QuoteSliceVariation>;

/**
 * Primary content in *Rich Text → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
  /**
   * Content field in *Rich Text → Default → Primary*
   *
   * - **Field Type**: Rich Text
   * - **Placeholder**: *None*
   * - **API ID Path**: rich_text.default.primary.content
   * - **Documentation**: https://prismic.io/docs/fields/rich-text
   */
  content: prismic.RichTextField;
}

/**
 * Default variation for Rich Text Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<
  "default",
  Simplify<RichTextSliceDefaultPrimary>,
  never
>;

/**
 * Slice variation for *Rich Text*
 */
type RichTextSliceVariation = RichTextSliceDefault;

/**
 * Rich Text Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<
  "rich_text",
  RichTextSliceVariation
>;

declare module "@prismicio/client" {
  interface CreateClient {
    (
      repositoryNameOrEndpoint: string,
      options?: prismic.ClientConfig,
    ): prismic.Client<AllDocumentTypes>;
  }

  interface CreateWriteClient {
    (
      repositoryNameOrEndpoint: string,
      options: prismic.WriteClientConfig,
    ): prismic.WriteClient<AllDocumentTypes>;
  }

  interface CreateMigration {
    (): prismic.Migration<AllDocumentTypes>;
  }

  namespace Content {
    export type {
      AuthorDocument,
      AuthorDocumentData,
      BlogPostDocument,
      BlogPostDocumentData,
      BlogPostDocumentDataSlicesSlice,
      CategoryDocument,
      CategoryDocumentData,
      SiteSettingsDocument,
      SiteSettingsDocumentData,
      AllDocumentTypes,
      CallToActionSlice,
      CallToActionSliceDefaultPrimary,
      CallToActionSliceVariation,
      CallToActionSliceDefault,
      HeroSlice,
      HeroSliceDefaultPrimary,
      HeroSliceVariation,
      HeroSliceDefault,
      ImageSlice,
      ImageSliceDefaultPrimary,
      ImageSliceVariation,
      ImageSliceDefault,
      QuoteSlice,
      QuoteSliceDefaultPrimary,
      QuoteSliceVariation,
      QuoteSliceDefault,
      RichTextSlice,
      RichTextSliceDefaultPrimary,
      RichTextSliceVariation,
      RichTextSliceDefault,
    };
  }
}
