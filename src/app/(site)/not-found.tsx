import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="phead" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <div className="glow" />
      <div className="wrap">
        <div className="lbl">404</div>
        <h1 className="ny">
          This page <span className="em">wandered off</span>.
        </h1>
        <p>The link may be old or mistyped. These still work:</p>
        <div className="hero-cta" style={{ marginTop: 30 }}>
          <Link href="/" className="btn solid">Home</Link>
          <Link href="/events" className="btn ghost">Events</Link>
          <Link href="/gallery" className="btn ghost">Gallery</Link>
        </div>
      </div>
    </div>
  );
}
