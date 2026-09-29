import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
export const { signIn, signOut, signUp, useSession } = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
