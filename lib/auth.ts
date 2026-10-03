import { betterAuth } from "better-auth";

import { db } from "./db";

export const auth = betterAuth({
  logger: { level: "debug" },
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["discord"],
    },
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
