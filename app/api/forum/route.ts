import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const [posts] = await db.query<RowDataPacket[]>(
    `SELECT
     p.*,
     u.name  AS authorName,
     u.image AS authorImage
   FROM posts p
   JOIN user u ON u.id = p.user_id`,
  );

  return NextResponse.json(posts);
}
