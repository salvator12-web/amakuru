import Link from "next/link";

const SECTIONS = [
  { href: "/category/politics", label: "Politics" },
  { href: "/category/business", label: "Business" },
  { href: "/category/culture", label: "Culture" },
  { href: "/category/sport", label: "Sport" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-papyrus px-4 pb-6 pt-9 sm:px-6">
      <div className="mb-7 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-2.5 font-display text-2xl italic text-ink">Amakuru</div>
          <p className="max-w-[32ch] text-[13px] leading-relaxed text-muted">
            Independent news for the Great Lakes region, reported in English, French, and Kirundi.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink">Sections</h4>
          <ul className="flex flex-col gap-2">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-[13px] text-charcoal hover:text-amber-deep">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink">Company</h4>
          <ul className="flex flex-col gap-2">
            <li><span className="text-[13px] text-charcoal">About</span></li>
            <li><span className="text-[13px] text-charcoal">Newsroom ethics</span></li>
            <li><span className="text-[13px] text-charcoal">Careers</span></li>
            <li><span className="text-[13px] text-charcoal">Contact</span></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink">Account</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/bookmarks" className="text-[13px] text-charcoal hover:text-amber-deep">Bookmarks</Link></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
        <span>© {new Date().getFullYear()} Amakuru.</span>
      </div>
    </footer>
  );
}
