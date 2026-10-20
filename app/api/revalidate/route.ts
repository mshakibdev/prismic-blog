import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { repositoryName } from "@/prismicio";

export async function POST(request: Request) {
  const secret = process.env.PRISMIC_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("secret" in body) ||
    typeof body.secret !== "string"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const received = Buffer.from(body.secret);
  const expected = Buffer.from(secret);
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    !("type" in body) ||
    !["api-update", "test-trigger"].includes(String(body.type))
  )
    return NextResponse.json({ error: "Unsupported webhook" }, { status: 400 });
  if (!("domain" in body) || body.domain !== repositoryName)
    return NextResponse.json(
      { error: "Unexpected repository" },
      { status: 400 },
    );
  if (body.type === "test-trigger")
    return NextResponse.json({ received: true });
  // Expire immediately so an unpublished article is not served from stale cache.
  revalidateTag("prismic", { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
