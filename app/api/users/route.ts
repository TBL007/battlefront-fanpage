import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const [result] = await db.query("SELECT name,id,image,allegiance, FROM user");
  return NextResponse.json(result);
}
