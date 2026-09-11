import { notFound } from "next/navigation";

// Hidden for now: not linked from nav or footer, and this route 404s if
// visited directly. The full catalog page is still in git history (this
// file, previous commit) - restore it whenever the store is ready to launch.
export default function StorePage() {
  notFound();
}
