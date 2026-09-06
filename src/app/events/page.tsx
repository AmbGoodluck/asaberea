import type { Metadata } from "next";
import EventsClient from "@/components/EventsClient";

export const metadata: Metadata = { title: "Events · ASA Berea" };

export default function EventsPage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Events</div>
          <h1 className="ny">Come <span className="em">gather</span> with us.</h1>
          <p>
            From cook-offs to conversations to our biggest night of the year — here&apos;s everything
            happening this semester, and where we&apos;ve been.
          </p>
        </div>
      </div>
      <EventsClient />
    </>
  );
}
