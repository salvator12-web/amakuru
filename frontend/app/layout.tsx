import type { Metadata } from "next";
import LanguageProvider from "@/lib/i18n/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amakuru",
  description: "Amakuru — Burundi & regional news",
};

/**
 * Root layout — wraps EVERY route in the app, including Next.js's own
 * auto-generated /_not-found page. Anything rendered under here (directly
 * or via a child component) that calls useLanguage() needs a
 * LanguageProvider above it in the tree, or it throws
 * "useLanguage must be used within a LanguageProvider" — which is exactly
 * what broke the Vercel build: this file used to be a near-duplicate of
 * app/admin/layout.tsx (calling useLanguage() itself, with no provider
 * and no <html>/<body> tags), so every prerendered page — including
 * _not-found — crashed.
 *
 * app/admin/layout.tsx is unaffected by this file and keeps its own
 * separate admin-shell logic (sidebar nav, staff-role gate, sign out).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
