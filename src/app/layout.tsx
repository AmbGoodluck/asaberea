import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { getImageSlots } from "@/lib/content";

// Self-hosted (no render-blocking request to Google, no extra DNS/TLS).
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

const SITE_URL = "https://asaberea.org";
const TITLE = "African Students Association · Berea College";
const DESC = "One continent. Many nations. One family. The African Students Association at Berea College.";

export async function generateMetadata(): Promise<Metadata> {
  const images = await getImageSlots();
  const share = images["og-share"];
  const ogImage = share?.url
    ? { url: share.url, alt: "ASA Berea" }
    : { url: "/logo.png", width: 592, height: 533, alt: "ASA Berea" };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: TITLE,
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
      siteName: TITLE,
      url: SITE_URL,
      title: TITLE,
      description: DESC,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESC,
      images: [ogImage.url],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body>{children}</body>
    </html>
  );
}
