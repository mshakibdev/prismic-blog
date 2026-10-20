// Test-only Content API adapter. Never loaded by the application itself.
import { readFileSync } from "node:fs";
if (process.env.PRISMIC_TEST_MODE !== "1")
  throw new Error("Prismic test adapter requires explicit test mode");
const originalFetch = global.fetch;
const text = (value, type = "paragraph") => [{ type, text: value, spans: [] }];
const document = (type, id, uid, data) => ({
  id,
  uid,
  type,
  href: "",
  tags: [],
  first_publication_date: "2026-10-01T12:00:00+0000",
  last_publication_date: "2026-10-14T12:00:00+0000",
  slugs: [uid],
  linked_documents: [],
  lang: "en-us",
  alternate_languages: [],
  url: type === "blog_post" ? `/blog/${uid}` : null,
  data,
});
const author = document("author", "test-author", "test-author", {
  name: "Test Editor",
  avatar: {},
  bio: text("An editorial biography for integration testing."),
});
const category = document("category", "test-category", "test-category", {
  name: "Perspectives",
  description: "Ideas for a thoughtful day.",
});
const relationship = (doc) => ({
  id: doc.id,
  type: doc.type,
  uid: doc.uid,
  lang: doc.lang,
  link_type: "Document",
  isBroken: false,
  data: doc.data,
});
const image = {
  dimensions: { width: 640, height: 640 },
  alt: "Three ascending green bars",
  copyright: null,
  url: "http://localhost:3101/icon.svg",
  id: "test-image",
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};
const slice = (type, primary) => ({
  slice_type: type,
  slice_label: null,
  id: type,
  variation: "default",
  version: "initial",
  primary,
  items: [],
});
const slices = [
  slice("hero", {
    heading: text("A thoughtful beginning", "heading1"),
    description: text("A small introduction from the CMS."),
    image: {},
  }),
  slice("rich_text", {
    content: [
      ...text("Make room for perspective", "heading2"),
      ...text("This paragraph comes from Prismic rich text."),
    ],
  }),
  slice("image", { image, caption: "An image caption managed in the CMS." }),
  slice("quote", {
    quote: text("Curiosity is the beginning of a good story."),
    attribution: "Test Editor",
  }),
  slice("call_to_action", {
    heading: text("Keep your curiosity", "heading1"),
    description: text("Discover more stories in the journal."),
    link: { link_type: "Web", url: "http://localhost:3101/blog" },
    button_label: "Explore more",
  }),
];
const posts = Array.from({ length: 12 }, (_, index) =>
  document("blog_post", `post-${index + 1}`, `story-${index + 1}`, {
    title: text(
      index === 0
        ? "A practical guide to thoughtful work"
        : `Perspective number ${index + 1}`,
      "heading1",
    ),
    featured_image: {},
    excerpt: "A concise excerpt managed in Prismic.",
    author: relationship(author),
    category: relationship(category),
    publish_date: `2026-10-${String(14 - index).padStart(2, "0")}`,
    featured: index === 0,
    slices: index === 0 ? slices : [slices[1]],
    meta_title: index === 0 ? "Thoughtful work" : null,
    meta_description:
      index === 0 ? "A </script><script>unsafe()</script> thought" : null,
    meta_image: {},
  }),
);
const settings = document("site_settings", "test-settings", null, {
  site_name: "The Test Journal",
  description: "A CMS-owned site description.",
  eyebrow: "THE TEST JOURNAL",
  intro_title: text("A fresh perspective.", "heading1"),
  intro_description: "A homepage introduction managed in the CMS.",
  footer_text: "A CMS-owned footer.",
  meta_image: {},
});

global.fetch = async function (input, options) {
  const url = new URL(
    typeof input === "string" ? input : input.url || input.toString(),
  );
  if (!url.hostname.endsWith(".prismic.io"))
    return originalFetch(input, options);
  const state = JSON.parse(
    readFileSync(process.env.PRISMIC_TEST_STATE, "utf8"),
  );
  const json = (value) =>
    new Response(JSON.stringify(value), {
      headers: { "content-type": "application/json" },
    });
  if (url.pathname === "/api/v2")
    return json({
      refs: [
        {
          id: "master",
          ref: "test-master",
          label: "Master",
          isMasterRef: true,
        },
      ],
      integrationFieldsRef: null,
      languages: [{ id: "en-us", name: "English", is_master: true }],
      types: state.empty
        ? {}
        : {
            blog_post: "Blog Post",
            author: "Author",
            category: "Category",
            site_settings: "Site Settings",
          },
      tags: [],
      forms: {},
      version: "test",
      license: "",
      bookmarks: {},
      experiments: {},
      oauth_initiate: "",
      oauth_token: "",
    });
  if (url.pathname.includes("/previews/"))
    return json({ mainDocument: "post-1" });
  if (!url.pathname.includes("/documents/search"))
    throw new Error(`Unexpected mock API request: ${url.pathname}`);
  const predicates = url.searchParams.getAll("q").join(" ");
  const preview = (url.searchParams.get("ref") || "").includes("previews/");
  let docs =
    preview || !state.empty ? [settings, author, category, ...posts] : [];
  if (state.unpublished && !preview)
    docs = docs.filter((doc) => doc.id !== "post-1");
  const type = predicates.match(/at\(document\.type,\s*"([^"]+)"/);
  if (type) docs = docs.filter((doc) => doc.type === type[1]);
  const uid = predicates.match(/at\(my\.blog_post\.uid,\s*"([^"]+)"/);
  if (uid) docs = docs.filter((doc) => doc.uid === uid[1]);
  const id = predicates.match(/at\(document\.id,\s*"([^"]+)"/);
  if (id) docs = docs.filter((doc) => doc.id === id[1]);
  const exclude = predicates.match(/not\(document\.id,\s*"([^"]+)"/);
  if (exclude) docs = docs.filter((doc) => doc.id !== exclude[1]);
  const categoryFilter = predicates.match(
    /at\(my\.blog_post\.category,\s*"([^"]+)"/,
  );
  if (categoryFilter)
    docs = docs.filter((doc) => doc.data.category?.id === categoryFilter[1]);
  const search = predicates.match(/fulltext\(document,\s*"([^"]+)"/);
  if (search)
    docs = docs.filter((doc) =>
      JSON.stringify(doc.data).toLowerCase().includes(search[1].toLowerCase()),
    );
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 20);
  const results = docs.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.ceil(docs.length / pageSize);
  const pageUrl = (n) => {
    const next = new URL(url);
    next.searchParams.set("page", n);
    return next.toString();
  };
  return json({
    page,
    results_per_page: pageSize,
    results_size: results.length,
    total_results_size: docs.length,
    total_pages: pages,
    next_page: page < pages ? pageUrl(page + 1) : null,
    prev_page: page > 1 ? pageUrl(page - 1) : null,
    results,
  });
};
