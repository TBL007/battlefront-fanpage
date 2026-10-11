import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans } from "next/font/google";
import { auth } from "@/lib/auth";
import styles from "./styles/layout.module.css";
import Header from "./components/header";
import Nav from "./components/nav";
import FactionProvider from "./components/faction";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Frontlinjen — Battlefront II fansamfunn",
  description:
    "A community hub for Star Wars Battlefront II. Discuss strategies, share screenshots and find people to play with. Not affiliated with EA or DICE.",
};

export const viewport: Viewport = {
  themeColor: "#0d1a2f",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /*
   * Read the allegiance on the server so `data-faction` is correct in the very
   * first byte of HTML. Previously it was hardcoded to "rebel" and corrected by
   * a client effect, so every refresh painted Republic before flipping.
   */
  const session = await auth.api.getSession({ headers: await headers() });
  const allegiance = session?.user.allegiance ?? true;
  const faction = allegiance ? "republic" : "empire";

  return (
    <html lang="en" className={plex.variable} data-faction={faction}>
      <body>
        <FactionProvider initialAllegiance={allegiance}>
          <Header />
          <main className={styles.page}>{children}</main>
          <Nav />
        </FactionProvider>
      </body>
    </html>
  );
}