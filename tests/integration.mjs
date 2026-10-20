import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cp, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const directory = await mkdtemp(path.join(tmpdir(), "tinyflow-blog-test-"));
const statePath = path.join(directory, "state.json");
await writeFile(statePath, JSON.stringify({}));
const secret = randomBytes(32).toString("hex");
const testDist = `.next-integration-${randomBytes(8).toString("hex")}`;
const buildPath = path.resolve(testDist);
await cp(path.resolve(".next"), buildPath, {
  recursive: true,
  filter: (source) =>
    !["cache", "dev"].includes(
      path.relative(path.resolve(".next"), source).split(path.sep)[0],
    ),
});
const base = "http://localhost:3101";
const child = spawn(
  process.execPath,
  [
    "--import",
    pathToFileURL(path.resolve("tests/mock-prismic.mjs")).href,
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3101",
  ],
  {
    env: {
      ...process.env,
      NEXT_TEST_DIST_DIR: testDist,
      PRISMIC_TEST_MODE: "1",
      PRISMIC_TEST_STATE: statePath,
      PRISMIC_WEBHOOK_SECRET: secret,
      SITE_URL: "https://journal.example.test",
      DISABLE_INDEXING: "false",
      VERCEL_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
child.stdout.on("data", (data) => {
  logs += data;
});
child.stderr.on("data", (data) => {
  logs += data;
});
const request = (route, options) => fetch(base + route, options);
const webhook = (body) =>
  request("/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      domain: "prismic-tiny-blog",
      secret,
      type: "api-update",
      ...body,
    }),
  });
const check = (name) => console.log(`PASS ${name}`);

try {
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Test server exited: ${logs}`);
    try {
      if ((await request("/icon.svg")).ok) break;
    } catch {}
    if (i === 99) throw new Error("Test server did not become ready");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal((await webhook()).status, 200);
  let html = await (await request("/")).text();
  assert.ok(html.includes("The Test Journal"));
  assert.ok(html.includes("A practical guide to thoughtful work"));
  assert.ok(html.includes("A homepage introduction managed in the CMS."));
  check("CMS settings and article listing");

  html = await (await request("/blog?page=2")).text();
  assert.ok(html.includes("Perspective number 10"));
  assert.ok(!html.includes("A practical guide to thoughtful work"));
  check("pagination");
  html = await (await request("/blog?q=practical&q=ignored")).text();
  assert.ok(html.includes("A practical guide to thoughtful work"));
  html = await (await request("/blog?q=missing-term")).text();
  assert.ok(html.includes("No stories found."));
  html = await (await request("/blog?category=test-category")).text();
  assert.ok(html.includes("Perspective number 2"));
  check("search, repeated parameters, and categories");

  html = await (await request("/blog/story-1")).text();
  for (const marker of [
    "A thoughtful beginning",
    "Make room for perspective",
    "An image caption managed",
    "Curiosity is the beginning",
    "Keep your curiosity",
    "Keep exploring",
    "Test Editor",
    "Three ascending green bars",
  ])
    assert.ok(html.includes(marker), marker);
  assert.ok(html.includes('name="description" content="A &lt;/script&gt;'));
  const structured = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s,
  );
  assert.ok(structured);
  const schema = JSON.parse(structured[1]);
  assert.equal(schema["@type"], "BlogPosting");
  assert.ok(!structured[1].includes("<"));
  check(
    "article, five slices, author, related posts, metadata, and safe JSON-LD",
  );

  html = await (
    await request("/blog/does-not-exist", {
      headers: { "User-Agent": "Googlebot" },
    })
  ).text();
  assert.ok(html.includes("This page isn’t here."));
  assert.ok(html.includes("noindex"));
  check("missing articles");

  const sitemap = await (await request("/sitemap.xml")).text();
  assert.ok(sitemap.includes("/blog/story-1"));
  assert.ok(sitemap.includes("/blog/story-12"));
  const shareImage = await request("/share-image");
  assert.equal(shareImage.headers.get("content-type"), "image/png");
  check("sitemap and generated sharing image");

  assert.equal((await webhook({ secret: "invalid" })).status, 401);
  assert.equal((await webhook({ domain: "another-repository" })).status, 400);
  assert.equal((await webhook({ type: "unexpected" })).status, 400);
  assert.equal(
    (
      await request("/api/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      })
    ).status,
    400,
  );
  assert.equal((await webhook({ type: "test-trigger" })).status, 200);
  check("webhook authorization and payload validation");

  await writeFile(statePath, JSON.stringify({ unpublished: true }));
  assert.equal((await webhook()).status, 200);
  html = await (
    await request("/blog/story-1", { headers: { "User-Agent": "Googlebot" } })
  ).text();
  assert.ok(html.includes("This page isn’t here."));
  assert.ok(
    !(await (await request("/sitemap.xml")).text()).includes(
      "/blog/story-1</loc>",
    ),
  );
  check("unpublishing expires article and sitemap caches");

  // Preview cookies come from the real Next.js draft-mode handler, with only the CMS mocked.
  await writeFile(statePath, JSON.stringify({ empty: true }));
  await webhook();
  const previewToken = "https://prismic-tiny-blog.prismic.io/previews/test";
  const preview = await request(
    `/api/preview?documentId=post-1&token=${encodeURIComponent(previewToken)}`,
    { redirect: "manual" },
  );
  assert.equal(preview.status, 307);
  const cookie = preview.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.ok(cookie.includes("__prerender_bypass"));
  html = await (
    await request("/blog/story-1", {
      headers: { Cookie: cookie, "User-Agent": "Googlebot" },
    })
  ).text();
  assert.ok(html.includes("A practical guide to thoughtful work"));
  assert.ok(html.includes("noindex"));
  const previewSitemap = await (
    await request("/sitemap.xml", { headers: { Cookie: cookie } })
  ).text();
  assert.ok(!previewSitemap.includes("/blog/story-1</loc>"));
  const exit = await request("/api/exit-preview", {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  assert.equal(exit.status, 200);
  assert.deepEqual(await exit.json(), { success: true });
  assert.ok(
    exit.headers
      .getSetCookie()
      .some(
        (value) =>
          value.includes("__prerender_bypass") && value.includes("1970"),
      ),
  );
  check(
    "unpublished draft previews, noindex, published-only sitemap, and preview exit",
  );

  console.log("All integration checks passed. No data was sent to Prismic.");
  if (logs.includes("Unexpected cache miss"))
    console.log(
      "Next.js emitted a background cache diagnostic; preview assertions still passed.",
    );
} catch (error) {
  console.error(logs.slice(-6000));
  throw error;
} finally {
  child.kill();
  if (child.exitCode === null)
    await new Promise((resolve) => child.once("exit", resolve));
  if (
    path.dirname(path.resolve(directory)) !== path.resolve(tmpdir()) ||
    !path.basename(directory).startsWith("tinyflow-blog-test-")
  )
    throw new Error("Unexpected test cleanup directory");
  await rm(directory, { recursive: true, force: true });
  if (
    path.dirname(buildPath) !== process.cwd() ||
    !path.basename(buildPath).startsWith(".next-integration-")
  )
    throw new Error("Unexpected test build directory");
  await rm(buildPath, { recursive: true, force: true });
}
