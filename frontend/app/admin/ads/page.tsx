"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { Plus, Trash2 } from "lucide-react";

interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: "hero-side" | "in-feed" | "sidebar" | "footer";
  active: boolean;
  impressions: number;
  clicks: number;
}

const PLACEMENTS: Ad["placement"][] = ["hero-side", "in-feed", "sidebar", "footer"];

export default function AdsPage() {
  const { authedFetch } = useAuthUser();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    targetUrl: "",
    placement: "in-feed" as Ad["placement"],
  });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authedFetch("/api/ads?all=true");
    if (res.ok) {
      const data = await res.json();
      setAds(data.ads ?? []);
    }
    setLoading(false);
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function createAd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim() || !form.targetUrl.trim()) return;
    setCreating(true);
    setError(null);
    const res = await authedFetch("/api/ads", {
      method: "POST",
      body: JSON.stringify({ ...form, active: true }),
    });
    if (res.ok) {
      setForm({ title: "", imageUrl: "", targetUrl: "", placement: "in-feed" });
      load();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't create the ad — check the image/target URLs are valid.");
    }
    setCreating(false);
  }

  async function toggleActive(ad: Ad) {
    await authedFetch(`/api/ads/${ad._id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !ad.active }),
    });
    load();
  }

  async function deleteAd(id: string) {
    if (!confirm("Delete this ad?")) return;
    await authedFetch(`/api/ads/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Advertisements</h1>
        <p className="mt-1 text-sm text-muted">Manage sponsored placements across the site.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-5 overflow-hidden rounded-[10px] border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">New ad</h2>
        </div>
        <form onSubmit={createAd} className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border border-line bg-papyrus/20 px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Placement</label>
            <select
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value as Ad["placement"] })}
              className="w-full rounded border border-line bg-papyrus/20 px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-teal"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
              className="w-full rounded border border-line bg-papyrus/20 px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Target URL</label>
            <input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="https://…"
              className="w-full rounded border border-line bg-papyrus/20 px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-teal"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex w-fit items-center gap-2 rounded bg-teal px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            <Plus size={14} /> {creating ? "Creating…" : "Create ad"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">All ads</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : ads.length === 0 ? (
          <p className="p-5 text-sm text-muted">No ads yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-papyrus/30 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted">
                <th className="px-5 py-2.5">Ad</th>
                <th className="px-5 py-2.5">Placement</th>
                <th className="px-5 py-2.5">Impressions</th>
                <th className="px-5 py-2.5">Clicks</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad._id} className="border-t border-line">
                  <td className="px-5 py-3 font-semibold text-ink">{ad.title}</td>
                  <td className="px-5 py-3 text-muted">{ad.placement}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{ad.impressions?.toLocaleString() ?? 0}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{ad.clicks?.toLocaleString() ?? 0}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        ad.active ? "bg-brand-soft text-teal" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ad.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteAd(ad._id)} className="text-muted hover:text-red-600" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
