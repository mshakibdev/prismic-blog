"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "80px 24px",
          textAlign: "center",
          background: "#f8f9f4",
          color: "#202d27",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>We couldn’t load the journal.</h1>
        <p>Please try again in a moment.</p>
        <button
          onClick={() => retry()}
          style={{ padding: "12px 24px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
