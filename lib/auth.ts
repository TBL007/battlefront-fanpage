import { betterAuth } from "better-auth";

import { db } from "./db";
import { customSession } from "better-auth/plugins";
import { RowDataPacket } from "mysql2";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      allegiance: {
        type: "boolean",
        required: true,
        defaultValue: true,
      },
      socials: {
        type: "json",
        required: false,
      },
    },
  },
});
