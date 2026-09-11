// A page-head hero photo, shown clearly (not washed out) with a wash that
// fades from the page background (behind the title) to fully transparent,
// so the text stays readable without dimming the photo.
export default function PheadBackdrop({
  slot,
}: {
  slot?: { url: string; position: string };
}) {
  if (!slot?.url) return null;
  return (
    <div
      className="phead-backdrop"
      style={{ backgroundImage: `url(${slot.url})`, backgroundPosition: slot.position }}
      aria-hidden
    />
  );
}
