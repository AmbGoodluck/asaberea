import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="grain" style={{ opacity: 0.3 }} />
      <div className="wrap" style={{ position: "relative" }}>
        <div className="f-grid">
          <div>
            <div className="f-brand">
              <span className="logo-mark" aria-hidden />
              <span className="ny" style={{ fontSize: 20, color: "var(--on-panel)" }}>
                ASA · Berea College
              </span>
            </div>
            <p style={{ fontSize: "14.5px", color: "var(--on-panel-soft)", margin: "20px 0 0", maxWidth: "34ch", lineHeight: 1.65 }}>
              The African Students Association — a voice, a home, and a family on Berea&apos;s campus.
            </p>
          </div>
          <div className="f-col">
            <div className="lbl">Explore</div>
            <div className="links">
              <Link href="/about">About</Link>
              <Link href="/stories">Blog &amp; Stories</Link>
              <Link href="/leadership">Leadership</Link>
            </div>
          </div>
          <div className="f-col">
            <div className="lbl">Take part</div>
            <div className="links">
              <Link href="/events">Events</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/store">Store</Link>
            </div>
          </div>
          <div className="f-col">
            <div className="lbl">Connect</div>
            <div className="links">
              <a href="https://instagram.com/asa.berea" target="_blank" rel="noreferrer">Instagram</a>
              <Link href="/about">Join ASA</Link>
              <Link href="/leadership">Contact the EC</Link>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <span>© 2026 African Students Association</span>
          <span>Berea College · Berea, Kentucky</span>
        </div>
      </div>
    </footer>
  );
}
