import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="journal-main empty-state">
      <span className="eyebrow">404 — A TURN IN THE STORY</span>
      <h1>This page isn’t here.</h1>
      <p>The story may have moved, or the address may be incomplete.</p>
      <Link href="/blog" className="button">
        Back to the journal ↗
      </Link>
    </main>
  );
}
