// ============================================================
// ASA Berea, content data
// This is the single source of truth for now. When the admin
// portal + Composio are wired up (see lib/composio.ts), these
// arrays get replaced by live fetches with the same shapes.
// ============================================================

export type EventItem = {
  date: string;
  time: string;
  title: string;
  venue: string;
  category: "Cultural" | "Social" | "Meeting" | "Panel";
  c1: string;
  c2: string;
  desc: string;
  status: "upcoming" | "past";
};

export const events: EventItem[] = [
  { date: "SEP 14", time: "6:00 PM", title: "Taste of Africa Night", venue: "Woods-Penn", category: "Cultural", c1: "#C2451F", c2: "#E39321", desc: "Food, music, and stories from every corner of the continent.", status: "upcoming" },
  { date: "SEP 21", time: "5:30 PM", title: "Welcome Mixer", venue: "Alumni Bldg", category: "Social", c1: "#0E7C6F", c2: "#0A5148", desc: "Meet the EC and your new ASA family over snacks and games.", status: "upcoming" },
  { date: "OCT 02", time: "7:00 PM", title: "Culture & Conversation", venue: "Fireside", category: "Panel", c1: "#5A1B48", c2: "#8A2C6B", desc: "An open forum on identity, home, and belonging.", status: "upcoming" },
  { date: "OCT 10", time: "8:00 PM", title: "Afrobeats Night", venue: "Seabury", category: "Social", c1: "#D89321", c2: "#B2401F", desc: "The dancefloor opens, Afrobeats, Amapiano, and more.", status: "upcoming" },
  { date: "OCT 18", time: "4:00 PM", title: "Jollof Cook-off", venue: "Danforth", category: "Cultural", c1: "#B23A20", c2: "#4A163B", desc: "Which country makes it best? Come taste and decide.", status: "upcoming" },
  { date: "OCT 25", time: "6:30 PM", title: "General Body Meeting", venue: "Draper 204", category: "Meeting", c1: "#0A5148", c2: "#0E7C6F", desc: "Updates, planning, and your voice in what's next.", status: "upcoming" },
  { date: "NOV 20", time: "8:00 PM", title: "ASA Annual Banquet", venue: "Boone Tavern", category: "Cultural", c1: "#C2451F", c2: "#E39321", desc: "Our biggest night, dinner, awards, and the outdooring.", status: "upcoming" },
  { date: "APR 12", time: "6:00 PM", title: "Africa Week Kickoff", venue: "Woods-Penn", category: "Cultural", c1: "#B2401F", c2: "#D89321", desc: "A full week celebrating the continent, opening night.", status: "past" },
  { date: "MAR 08", time: "7:00 PM", title: "Career & Grad Panel", venue: "Carter", category: "Panel", c1: "#3A2A12", c2: "#C89127", desc: "Alumni and mentors on life after Berea.", status: "past" },
  { date: "FEB 14", time: "8:00 PM", title: "Diaspora Night", venue: "Baird", category: "Cultural", c1: "#4A163B", c2: "#B23A20", desc: "A celebration of Africa and its diaspora, together.", status: "past" },
  { date: "JAN 30", time: "5:30 PM", title: "New Semester Kickoff", venue: "Union Lounge", category: "Social", c1: "#0E7C6F", c2: "#3A2A12", desc: "Back together, reconnect and plan the term.", status: "past" },
  { date: "DEC 05", time: "7:30 PM", title: "Movie & Game Night", venue: "Union Lounge", category: "Social", c1: "#0C6B63", c2: "#08514B", desc: "Films, board games, and jollof to close the year.", status: "past" },
];

export type Role = {
  role: string;
  duty: string;
  c1: string;
  c2: string;
  tag?: string;
};

export const roster: Role[] = [
  { role: "President", duty: "Presides over ASA, our official voice, and steward of the association's vision.", c1: "#C2451F", c2: "#E39321", tag: "Primary EC" },
  { role: "Vice-President", duty: "Steps in for the President and coordinates the ASA Networking Program.", c1: "#0E7C6F", c2: "#0A5148", tag: "Primary EC" },
  { role: "Treasurer", duty: "Manages finances and fundraising, and keeps our records accurate and current.", c1: "#5A1B48", c2: "#8A2C6B", tag: "Primary EC" },
  { role: "Chief Events Coordinator", duty: "Designs and runs the programs and events that bring ASA to life.", c1: "#D89321", c2: "#B2401F", tag: "Primary EC" },
  { role: "Assistant Events Coordinator", duty: "Supports the Chief Coordinator across planning and event day.", c1: "#B23A20", c2: "#4A163B" },
  { role: "Secretary", duty: "Keeps minutes, attendance, and the constitution; our historian and administrator.", c1: "#0A5148", c2: "#0E7C6F" },
  { role: "Public Relations Officer", duty: "Designs materials and strategy that promote ASA and its events.", c1: "#3A2A12", c2: "#C89127" },
  { role: "Assoc. PR Officer", duty: "Assists the PRO and steps in when needed across communications.", c1: "#4A163B", c2: "#7A2A5F" },
  { role: "Bridging the Gap Coordinator", duty: "Builds alliances and inter-club relations across campus groups.", c1: "#0C6B63", c2: "#3A2A12" },
  { role: "Webmaster / Dir. of Technology", duty: "Runs ASA's technology and keeps this very website current.", c1: "#C89127", c2: "#D98A1E" },
];

export type Product = {
  name: string;
  price: string;
  sizes: string;
  c1: string;
  c2: string;
};

export const products: Product[] = [
  { name: "ASA Classic Tee", price: "$18", sizes: "S to XXL", c1: "#C2451F", c2: "#E39321" },
  { name: "Kente Hoodie", price: "$38", sizes: "S to XXL", c1: "#5A1B48", c2: "#8A2C6B" },
  { name: "One Family Tote", price: "$14", sizes: "One size", c1: "#0E7C6F", c2: "#0A5148" },
  { name: "Continent Cap", price: "$20", sizes: "Adjustable", c1: "#D89321", c2: "#B2401F" },
  { name: "Sticker Pack", price: "$6", sizes: "Set of 6", c1: "#0A5148", c2: "#0E7C6F" },
  { name: "ASA Enamel Mug", price: "$12", sizes: "11 oz", c1: "#4A163B", c2: "#B23A20" },
];

export type GalleryItem = { caption: string; c1: string; c2: string; ratio: number };

export const gallery: GalleryItem[] = [
  { caption: "Taste of Africa Night", c1: "#C2451F", c2: "#E39321", ratio: 1.3 },
  { caption: "Afrobeats Night", c1: "#5A1B48", c2: "#8A2C6B", ratio: 1 },
  { caption: "Annual Banquet", c1: "#0E7C6F", c2: "#0A5148", ratio: 1.5 },
  { caption: "Jollof Cook-off", c1: "#D89321", c2: "#B2401F", ratio: 1 },
  { caption: "Diaspora Night", c1: "#4A163B", c2: "#B23A20", ratio: 1.2 },
  { caption: "General Body Meeting", c1: "#0A5148", c2: "#0E7C6F", ratio: 1 },
  { caption: "Welcome Mixer", c1: "#3A2A12", c2: "#C89127", ratio: 1.4 },
  { caption: "Culture & Conversation", c1: "#5A1B48", c2: "#7A2A5F", ratio: 1 },
  { caption: "Africa Week", c1: "#C2451F", c2: "#4A163B", ratio: 1.1 },
  { caption: "Movie Night", c1: "#0C6B63", c2: "#08514B", ratio: 1.35 },
  { caption: "Career Panel", c1: "#B2401F", c2: "#D89321", ratio: 1 },
  { caption: "Outdooring", c1: "#4A163B", c2: "#C2451F", ratio: 1.25 },
];

export type Spotlight = { name: string; headline: string; description: string };

export const spotlights: Spotlight[] = [
  { name: "Aminata K.", headline: "Published undergraduate researcher", description: "Co-authored a paper on renewable microgrids and presented at the regional science symposium." },
  { name: "Kwame O.", headline: "National debate finalist", description: "Reached the national collegiate debate finals and now coaches first-year members." },
  { name: "Zainab M.", headline: "Founder, campus mentorship circle", description: "Started a mentorship circle pairing new international students with upperclass members." },
];

export const pillars = [
  { idx: "01", title: "Cultural", desc: "Sharing the diversity and richness of Africa with the whole campus community." },
  { idx: "02", title: "Social", desc: "A meeting place across every race, faith, and field of study, in the spirit of unity." },
  { idx: "03", title: "Educational", desc: "Helping our members learn, cope, and thrive within the college system." },
  { idx: "04", title: "Media", desc: "Staying abreast of the news and ideas that shape the African world." },
];

export const grad = (a: string, b: string) => `linear-gradient(142deg, ${a}, ${b})`;
