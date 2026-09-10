import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";
import { getGallery } from "@/lib/content";
import { BOX_PHOTOS_URL } from "@/lib/links";

export const revalidate = 60;
export const metadata: Metadata = { title: "Gallery · ASA Berea" };

export default async function GalleryPage() {
  const items = await getGallery();
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
      <section style={{ padding: "44px 0 92px" }}>
        <div className="wrap">
          <a className="box-banner" href={BOX_PHOTOS_URL} target="_blank" rel="noreferrer">
            <span className="box-banner-ic" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" />
                <path d="M3 7v10l9 4 9-4V7" />
                <path d="M12 11v10" />
              </svg>
            </span>
            <span className="box-banner-txt">
              <strong>Looking for your photo?</strong>
              <span>Browse the full ASA photo archive on Box, every event, all the frames.</span>
            </span>
            <span className="box-banner-go">
              Open Box folder
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </a>
          <GalleryClient items={items} />
        </div>
      </section>
    </>
  );
}
