"use client";

import { useState } from "react";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

export interface MediaItem {
  _id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  type: "image" | "video";
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  altText?: string;
  uploadedBy: string;
  createdAt: string;
}

interface MediaLibraryGridProps {
  items: MediaItem[];
  onChanged: () => void; // parent refetches after delete/edit
  /** Picker mode renders a "Select" button per item instead of manage controls. */
  mode?: "manage" | "pick";
  onPick?: (item: MediaItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryGrid({
  items,
  onChanged,
  mode = "manage",
  onPick,
}: MediaLibraryGridProps) {
  const { authedFetch } = useAuthUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function saveAltText(id: string) {
    setBusyId(id);
    try {
      await authedFetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: altDraft }),
      });
      onChanged();
    } finally {
      setBusyId(null);
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item? This removes it from Cloudinary too.")) return;
    setBusyId(id);
    try {
      await authedFetch(`/api/media/${id}`, { method: "DELETE" });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">No media uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item._id} className="overflow-hidden rounded border border-line bg-white">
          <div className="aspect-video w-full bg-papyrus">
            {item.type === "image" ? (
              <img
                src={item.secureUrl}
                alt={item.altText || ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={item.secureUrl} className="h-full w-full object-cover" muted />
            )}
          </div>
          <div className="space-y-1 p-2 text-xs text-muted">
            <div className="truncate font-medium text-charcoal">{item.publicId.split("/").pop()}</div>
            <div>
              {item.format.toUpperCase()} · {formatBytes(item.bytes)}
              {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
            </div>

            {editingId === item._id ? (
              <div className="flex gap-1">
                <input
                  className="w-full rounded border border-line px-1 py-0.5 text-xs"
                  value={altDraft}
                  onChange={(e) => setAltDraft(e.target.value)}
                  placeholder="Alt text"
                />
                <button
                  disabled={busyId === item._id}
                  onClick={() => saveAltText(item._id)}
                  className="rounded bg-teal px-2 text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="truncate">{item.altText || "No alt text"}</div>
            )}

            {mode === "pick" ? (
              <button
                onClick={() => onPick?.(item)}
                className="mt-1 w-full rounded bg-teal px-2 py-1 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Select
              </button>
            ) : (
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(item._id);
                    setAltDraft(item.altText || "");
                  }}
                  className="text-teal hover:underline"
                >
                  Edit alt
                </button>
                <button
                  disabled={busyId === item._id}
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
