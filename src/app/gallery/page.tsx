import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";

export const metadata: Metadata = { title: "Gallery · ASA Berea" };

export default function GalleryPage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Gallery</div>
          <h1 className="ny">Moments, <span className="em">made together</span>.</h1>
          <p>A look back at the food, the color, the dancing, and the faces that make ASA what it is. Tap any photo to view.</p>
        </div>
      </div>
      <section style={{ padding: "64px 0 92px" }}>
        <div className="wrap">
          <GalleryClient />
        </div>
      </section>
    </>
  );
}
