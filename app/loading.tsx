export default function Loading() {
  return (
    <main
      id="main-content"
      className="journal-main loading-state"
      aria-busy="true"
      aria-label="Loading stories"
    >
      <div className="skeleton skeleton-label" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-feature" />
      <p className="sr-only" role="status">
        Loading stories…
      </p>
    </main>
  );
}
