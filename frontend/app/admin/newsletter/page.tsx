"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { Trash2 } from "lucide-react";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  active: boolean;
  subscribedAt: string;
}

export default function NewsletterPage() {
  const { authedFetch } = useAuthUser();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authedFetch("/api/newsletter");
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers ?? []);
    }
    setLoading(false);
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function unsubscribe(email: string) {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    await authedFetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    load();
  }

  const activeCount = subscribers.filter((s) => s.active).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Newsletters</h1>
        <p className="mt-1 text-sm text-muted">Everyone signed up through the site footer.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[10px] border border-line bg-white p-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Active subscribers</div>
          <div className="font-mono text-[26px] font-extrabold text-ink">{activeCount.toLocaleString()}</div>
        </div>
        <div className="rounded-[10px] border border-line bg-white p-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Total ever signed up</div>
          <div className="font-mono text-[26px] font-extrabold text-ink">{subscribers.length.toLocaleString()}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Subscribers</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : subscribers.length === 0 ? (
          <p className="p-5 text-sm text-muted">No subscribers yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-papyrus/30 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted">
                <th className="px-5 py-2.5">Email</th>
                <th className="px-5 py-2.5">Name</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Subscribed</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id} className="border-t border-line">
                  <td className="px-5 py-3 font-mono text-xs text-ink">{s.email}</td>
                  <td className="px-5 py-3 text-muted">{s.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        s.active ? "bg-brand-soft text-teal" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {s.active && (
                      <button onClick={() => unsubscribe(s.email)} className="text-muted hover:text-red-600" title="Unsubscribe">
                        <Trash2 size={14} />
                      </button>
                    )}
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
