import { ScrollText } from "lucide-react";
import RequireRole from "@/components/admin/RequireRole";

export default function AuditLogPage() {
  return (
    <RequireRole roles={[]}>
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-adminNavy">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">A record of who changed what, and when.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <ScrollText size={28} className="mb-3 text-gray-500" />
        <h2 className="text-sm font-bold text-adminNavy">Coming soon</h2>
        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
          There&apos;s no audit-log collection in the backend yet. Once staff actions (publish, delete, role
          change, etc.) are recorded somewhere with a `GET /api/audit-log` route, this page can list them.
        </p>
      </div>
    </div>
    </RequireRole>
  );
}
