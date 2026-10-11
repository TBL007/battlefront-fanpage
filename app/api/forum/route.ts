import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = ["forum", "gallery"] as const;
type PostType = (typeof VALID_TYPES)[number];

export async function GET(req: NextRequest) {
  // Gallery entries share the `posts` table, so callers must be able to filter.
  const requested = req.nextUrl.searchParams.get("type");
  const type: PostType | null = VALID_TYPES.includes(requested as PostType)
    ? (requested as PostType)
    : null;

  const [posts] = await db.query<RowDataPacket[]>(
    type
      ? `SELECT
           p.*,
           u.name  AS authorName,
           u.image AS authorImage,
           u.allegiance AS authorAllegiance
         FROM posts p
         JOIN user u ON u.id = p.user_id
         WHERE p.type = ?
         ORDER BY p.created_at DESC`
      : `SELECT
           p.*,
           u.name  AS authorName,
           u.image AS authorImage,
           u.allegiance AS authorAllegiance
         FROM posts p
         JOIN user u ON u.id = p.user_id
         ORDER BY p.created_at DESC`,
    type ? [type] : [],
  );

  return NextResponse.json(posts);
}