"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import GalleryBulkUpload from "@/components/admin/GalleryBulkUpload";
import EntityManager, { type Field } from "@/components/admin/EntityManager";
import { IMAGE_SLOTS } from "@/lib/firebase/schema";

const galleryFields: Field[] = [
  { key: "imageUrl", label: "Photo", type: "image", folder: "gallery" },
  { key: "caption", label: "Caption", type: "text", placeholder: "Taste of Africa Night" },
  { key: "order", label: "Order", type: "number" },
];

export default function ImagesAdmin() {
  const { authedFetch } = useAdmin();
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("/api/admin/images");
        if (res.ok) {
          const data = await res.json();
          setSlots(data.items || {});
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authedFetch]);

  async function saveSlot(slot: string, url: string) {
    setSlots((s) => ({ ...s, [slot]: url }));
    setSavingSlot(slot);
    try {
      await authedFetch("/api/admin/images", { method: "PUT", body: JSON.stringify({ slot, url }) });
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Images</h1>
          <p>Swap the images used across the site, and manage the photo gallery, without touching code.</p>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 26 }}>
        <h3>Page images</h3>
        {loading ? (
          <div className="a-empty">Loading...</div>
        ) : (
          <div className="slots-grid">
            {IMAGE_SLOTS.map((slot) => (
              <div key={slot.id}>
                <ImageUpload
                  label={slot.label + (savingSlot === slot.id ? " (saving...)" : "")}
                  value={slots[slot.id] || ""}
                  folder={"slots/" + slot.id}
                  onChange={(url) => saveSlot(slot.id, url)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <GalleryBulkUpload onDone={() => setGalleryKey((k) => k + 1)} />

      <EntityManager
        key={galleryKey}
        resource="gallery"
        title="Gallery photos"
        subtitle="These appear in the gallery and the 'Always something happening' strip on the homepage. Use the box above to add many at once, or add one here with a custom caption."
        fields={galleryFields}
        primaryKey="caption"
      />
    </div>
  );
}
