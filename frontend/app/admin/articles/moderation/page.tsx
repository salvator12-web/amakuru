// NEW — Phase 4
import ModerationQueue from "@/components/admin/ModerationQueue";

export default function ModerationPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Comment Moderation</h1>
      <p className="mt-1 text-sm text-slate-500">
        Review comments before they go live, and handle anything readers have flagged.
      </p>
      <div className="mt-6">
        <ModerationQueue />
      </div>
    </div>
  );
}
