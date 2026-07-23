import type { Metadata } from "next";
import "./globals.css";
import "../styles/effects.css";

export const metadata: Metadata = {
  title: "Keilas Studio Extension | Premium Hair — Accra",
  description:
    "Premium quality raw virgin bundles, HD lace wigs, extensions & closures. Accra's finest luxury hair brand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
