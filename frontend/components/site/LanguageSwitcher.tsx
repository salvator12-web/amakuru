"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import type { SupportedLanguage } from "@/lib/types";

const LANGUAGES: { code: SupportedLanguage; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "rn", label: "Ikinyarwanda", short: "RN" },
];

const STORAGE_KEY = "amakuru_lang";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLang(saved);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function choose(code: SupportedLanguage) {
    setLang(code);
    window.localStorage.setItem(STORAGE_KEY, code);
    document.cookie = `amakuru_lang=${code}; path=/; max-age=31536000`;
    setOpen(false);
    // NOTE: this only stores the reader's preference for now — article
    // content itself is single-language until the backend's `title`/`dek`/
    // `body` fields grow { en, fr, rn } variants (see Article.ts comment).
  }

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded border border-ink px-2.5 py-1.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white"
      >
        <Globe size={16} strokeWidth={1.75} />
        {current.short}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded border border-line bg-white py-1 shadow-sm">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-papyrus ${
                l.code === lang ? "font-semibold text-ink" : "text-charcoal"
              }`}
            >
              {l.label}
              {l.code === lang && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
