import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";

// Self-hosted (no render-blocking request to Google, no extra DNS/TLS).
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

const SITE_URL = "https://asaberea.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "African Students Association · Berea College",
    template: "%s · ASA Berea",
  },
  description:
    "A home for African students at Berea. Culture, community, events, and stories from the African Students Association.",
  applicationName: "ASA Berea",
  keywords: [
    "African Students Association",
    "ASA",
    "Berea College",
    "Berea Kentucky",
    "African students",
    "student organization",
  ],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    type: "website",
    siteName: "African Students Association · Berea College",
    url: SITE_URL,
    title: "African Students Association · Berea College",
    description:
      "One continent. Many nations. One family. The African Students Association at Berea College.",
    images: [{ url: "/logo.png", width: 592, height: 533, alt: "ASA Berea" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "African Students Association · Berea College",
    description:
      "One continent. Many nations. One family. The African Students Association at Berea College.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body>{children}</body>
    </html>
  );
}
