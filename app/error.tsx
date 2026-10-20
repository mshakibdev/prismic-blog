"use client";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main id="main-content" className="journal-main empty-state">
      <h1>We couldn’t load the stories.</h1>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={() => retry()}>
        Try again ↗
      </button>
    </main>
  );
}
