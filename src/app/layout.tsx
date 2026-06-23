import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cn } from "~/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Bibelbølgen",
  description: "Hjelp meg å lese Bibelen på fem måneder.",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.ico" },
  ],
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#294d31",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={cn("font-sans", geist.variable)} lang="nb">
      <body>{children}</body>
    </html>
  );
}
