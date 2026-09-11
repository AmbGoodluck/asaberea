import type { Metadata } from "next";
import EventsClient from "@/components/EventsClient";
import PheadBackdrop from "@/components/PheadBackdrop";
import { getEvents, getImageSlots } from "@/lib/content";

export const revalidate = 60;
export const metadata: Metadata = { title: "Events · ASA Berea" };

export default async function EventsPage() {
  const [events, images] = await Promise.all([getEvents(), getImageSlots()]);
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <PheadBackdrop slot={images["events-hero"]} />
        <div className="wrap">
          <div className="lbl">Events</div>
          <h1 className="ny">Come <span className="em">gather</span> with us.</h1>
          <p>
            From cook-offs to conversations to our biggest night of the year, here is everything
            happening this semester, and where we have been.
          </p>
        </div>
      </div>
      <EventsClient events={events} />
    </>
  );
}
