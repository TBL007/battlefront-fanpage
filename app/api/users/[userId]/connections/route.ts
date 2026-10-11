import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

/**
 * Which OAuth providers a member has connected, plus the identifier needed to
 * build a profile link. Used by the profile page to show a Discord badge and to
 * decide whether to offer a "Link Discord" button.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/users/[userId]/connections">,
) {
  const { userId } = await ctx.params;

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT providerId, accountId FROM account WHERE userId = ?`,
    [userId],
  );

  const discord = rows.find((row) => String(row.providerId) === "discord");
  const discordUserId = discord ? String(discord.accountId) : null;

  return NextResponse.json({
    discord: Boolean(discord),
    discordUserId,
  } satisfies Global.UserConnections);
}