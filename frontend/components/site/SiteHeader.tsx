"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import AuthModal from "@/components/AuthModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/politics", label: "Politics" },
  { href: "/category/business", label: "Business" },
  { href: "/category/culture", label: "Culture" },
  { href: "/category/sport", label: "Sport" },
];

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SiteHeader() {
  const { profile, firebaseUser, loading } = useAuthUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isSignedIn = !loading && !!firebaseUser;

  return (
    <>
      <div className="flex items-center justify-between bg-ink px-4 py-1.5 text-[12.5px] text-[#EDE9DD] sm:px-6">
        <span className="font-mono opacity-80">{today}</span>
        <span className="hidden font-mono text-[11px] text-[#B9B4A2] sm:inline">
          Great Lakes region, in three voices
        </span>
      </div>

      <header className="relative flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-[32px] italic font-semibold sm:text-[38px]">Amakuru</span>
        </Link>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full z-20 flex-col gap-0 border-t border-line border-b-[3px] border-b-ink bg-white px-4 py-2 sm:static sm:z-auto sm:flex sm:flex-row sm:items-center sm:gap-7 sm:border-0 sm:bg-transparent sm:p-0`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="w-full border-b border-line py-2.5 text-sm font-semibold text-charcoal hover:text-amber-deep sm:w-auto sm:border-0 sm:border-b-2 sm:border-transparent sm:py-0 sm:pb-1 sm:hover:border-amber"
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn ? (
            <Link
              href="/bookmarks"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-full bg-papyrus py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-ink sm:mt-0"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal font-display text-[11px] font-semibold text-white">
                {initials(profile?.name || firebaseUser?.displayName)}
              </span>
              {profile?.name || firebaseUser?.displayName || "Account"}
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                setAuthOpen(true);
              }}
              className="mt-2 rounded border border-ink px-4 py-2 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white sm:mt-0"
            >
              Sign in
            </button>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="rounded border border-ink px-3 py-2 font-mono text-[13px] font-bold text-ink sm:hidden"
        >
          {menuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={() => setAuthOpen(false)} />
    </>
  );
}
