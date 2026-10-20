import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "70px 80px",
        background: "#f7f8f2",
        color: "#202d27",
      }}
    >
      <div style={{ display: "flex", fontSize: 30 }}>{site.name}.</div>
      <div
        style={{
          display: "flex",
          fontSize: 92,
          lineHeight: 1.05,
          maxWidth: 900,
        }}
      >
        A fresh perspective.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #cbd0c5",
          paddingTop: 24,
          fontSize: 24,
        }}
      >
        <span>Ideas, stories, and perspectives.</span>
        <span>↗</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
