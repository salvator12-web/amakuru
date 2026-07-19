"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

const STAFF_ROLES = ["Admin", "Editor", "Author"];

const NAV_ITEMS = [
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/moderation", label: "Comment Moderation" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, firebaseUser } = useAuthUser();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!firebaseUser || !profile) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Sign in required</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in from the homepage first, then come back to the admin dashboard.
        </p>
        <Link href="/" className="mt-4 inline-block rounded bg-teal px-4 py-2 text-sm font-semibold text-white">
          Go to homepage
        </Link>
      </div>
    );
  }

  if (!STAFF_ROLES.includes(profile.role)) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">
          Your account role (<strong>{profile.role}</strong>) doesn&apos;t have access to the
          admin dashboard. Ask an Admin to change your role.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-papyrus/40">
      <aside className="w-56 shrink-0 border-r border-line bg-white p-4">
        <div className="mb-6 px-2">
          <div className="font-display text-lg font-semibold text-ink">Amakuru</div>
          <div className="text-xs text-muted">Admin dashboard</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-medium ${
                  active ? "bg-brand-soft text-teal" : "text-charcoal hover:bg-papyrus"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {profile.role === "Admin" && (
            <Link
              href="/admin/users"
              className={`rounded px-3 py-2 text-sm font-medium ${
                pathname?.startsWith("/admin/users")
                  ? "bg-brand-soft text-teal"
                  : "text-charcoal hover:bg-papyrus"
              }`}
            >
              Users &amp; Roles
            </Link>
          )}
        </nav>
        <div className="mt-8 border-t border-line px-2 pt-4 text-xs text-muted">
          Signed in as
          <div className="mt-1 font-medium text-charcoal">{profile.name}</div>
          <div>{profile.role}</div>
          <button
            onClick={() => signOut(auth)}
            className="mt-3 w-full rounded border border-ink px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
