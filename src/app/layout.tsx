import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "African Students Association · Berea College",
  description:
    "A home for African students at Berea. Culture, community, events, and stories from the African Students Association.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
