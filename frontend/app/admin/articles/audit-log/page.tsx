import { ScrollText } from "lucide-react";

export default function AuditLogPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Audit Log</h1>
        <p className="mt-1 text-sm text-muted">A record of who changed what, and when.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-line bg-white px-6 py-16 text-center">
        <ScrollText size={28} className="mb-3 text-muted" />
        <h2 className="text-sm font-bold text-ink">Coming soon</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          There&apos;s no audit-log collection in the backend yet. Once staff actions (publish, delete, role
          change, etc.) are recorded somewhere with a `GET /api/audit-log` route, this page can list them.
        </p>
      </div>
    </div>
  );
}
