"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in Workers logs.
    console.error("Site error:", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="phead" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <div className="glow" />
      <div className="wrap">
        <div className="lbl">Something went wrong</div>
        <h1 className="ny">A hiccup on our end.</h1>
        <p>
          The page didn&apos;t load properly. Try again, or head back to the homepage while we
          sort it out.
        </p>
        <div className="hero-cta" style={{ marginTop: 30 }}>
          <button className="btn solid" onClick={reset}>Try again</button>
          <Link href="/" className="btn ghost">Go home</Link>
        </div>
      </div>
    </div>
  );
}
