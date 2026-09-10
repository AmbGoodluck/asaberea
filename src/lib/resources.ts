import "server-only";
import { z } from "zod";
import {
  COL,
  eventInput,
  spotlightInput,
  leaderInput,
  galleryInput,
} from "./firebase/schema";

// Maps a resource name (used in the API path) to its Firestore collection and
// the zod schema that validates create/update payloads.
export const RESOURCES: Record<string, { collection: string; schema: z.ZodTypeAny }> = {
  events: { collection: COL.events, schema: eventInput },
  spotlights: { collection: COL.spotlights, schema: spotlightInput },
  leadership: { collection: COL.leadership, schema: leaderInput },
  gallery: { collection: COL.gallery, schema: galleryInput },
};

export function getResource(name: string) {
  return RESOURCES[name] ?? null;
}
