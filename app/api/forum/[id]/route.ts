import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const [result] = await db.query<RowDataPacket[]>(
    "SELECT * FROM posts where id = ?",
    [postId],
  );
  return NextResponse.json(result[0]);
}
