import type { Metadata } from "next";
import EventsClient from "@/components/EventsClient";
import { getEvents } from "@/lib/content";

export const revalidate = 60;
export const metadata: Metadata = { title: "Events · ASA Berea" };

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <>
      <div className="phead">
        <div className="glow" />
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
