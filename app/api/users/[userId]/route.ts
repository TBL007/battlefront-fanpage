import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

/** Only UploadThing's CDN is allowed as an image source. */
const isAllowedImageUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.length > 2048) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return url.hostname === "d7q5o5c3i3.ufs.sh";
  } catch {
    return false;
  }
};

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">,
) {
  const { userId } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT image,name,socials,createdAt,allegiance FROM user WHERE id = ?",
    [userId],
  );

  const [posts] = await db.query<RowDataPacket[]>(
    "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
  const [comments] = await db.query<RowDataPacket[]>(
    "SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = rows[0];
  return NextResponse.json({
    name: user.name,
    image: user.image,
    socials: user.socials,
    createdAt: user.createdAt,
    allegiance: user.allegiance,
    posts,
    comments,
  });
}

/** Lets a member update their own profile picture. */
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/users/[userId]">,
) {
  const { userId } = await ctx.params;

  // Reuse the session helper rather than trusting the body for identity.
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { image?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isAllowedImageUrl(body.image)) {
    return NextResponse.json(
      { error: "Image must be an UploadThing URL" },
      { status: 400 },
    );
  }

  await db.execute("UPDATE user SET image = ? WHERE id = ?", [
    body.image,
    userId,
  ]);

  return NextResponse.json({ image: body.image });
}