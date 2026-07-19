"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import type { ArticleSummary, CategorySummary } from "@/lib/types";
import SiteChrome from "@/components/site/SiteChrome";
import BreakingTicker from "@/components/site/BreakingTicker";
import ArticleCard from "@/components/site/ArticleCard";
import SectionHead from "@/components/site/SectionHead";
import NewsletterBox from "@/components/site/NewsletterBox";

const SECTION_DOTS: Record<string, string> = {
  politics: "#C4632B", // amber-deep
  business: "#2F6F5E", // teal
  culture: "#8B5FBF",
  sport: "#C9302C",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const hrs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [breaking, setBreaking] = useState<ArticleSummary[]>([]);
  const [featured, setFeatured] = useState<ArticleSummary | null>(null);
  const [sidePicks, setSidePicks] = useState<ArticleSummary[]>([]);
  const [sectionArticles, setSectionArticles] = useState<Record<string, ArticleSummary[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [catsRes, latestRes, breakingRes] = await Promise.all([
          fetch(apiUrl("/api/categories")),
          fetch(apiUrl("/api/articles?limit=9")),
          fetch(apiUrl("/api/articles?limit=6")), // filtered client-side for isBreaking below
        ]);

        if (!catsRes.ok || !latestRes.ok) throw new Error("Failed to load homepage data");

        const catsData = await catsRes.json();
        const latestData = await latestRes.json();
        const breakingData = breakingRes.ok ? await breakingRes.json() : { articles: [] };

        if (cancelled) return;

        const cats: CategorySummary[] = catsData.categories || [];
        const latest: ArticleSummary[] = latestData.articles || [];

        setCategories(cats);
        setBreaking((breakingData.articles || []).filter((a: ArticleSummary) => a.isBreaking));

        const featuredArticle = latest.find((a) => a.isFeatured) || latest[0] || null;
        setFeatured(featuredArticle);
        setSidePicks(latest.filter((a) => a._id !== featuredArticle?._id).slice(0, 4));

        // Pull one section's worth of articles per category (first 3 categories).
        const sectionsToShow = cats.slice(0, 3);
        const results = await Promise.all(
          sectionsToShow.map((c) =>
            fetch(apiUrl(`/api/articles?category=${c._id}&limit=4`)).then((r) => (r.ok ? r.json() : { articles: [] }))
          )
        );
        if (cancelled) return;
        const map: Record<string, ArticleSummary[]> = {};
        sectionsToShow.forEach((c, i) => {
          map[c._id] = results[i].articles || [];
        });
        setSectionArticles(map);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <SiteChrome>
        <div className="flex min-h-[50vh] items-center justify-center font-mono text-sm text-muted">
          Loading the front page…
        </div>
      </SiteChrome>
    );
  }

  if (error) {
    return (
      <SiteChrome>
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="font-mono text-sm text-muted">
            Couldn't reach the backend. Is it running?
          </p>
          <p className="mt-2 font-mono text-xs text-muted">{error}</p>
        </div>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome>
      <BreakingTicker articles={breaking} />

      {/* Hero */}
      {featured && (
        <section className="border-b border-line px-4 py-8 sm:px-6 lg:py-12">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
            <Link href={`/articles/${featured.slug}`} className="group block">
              <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-sm bg-papyrus">
                {featured.coverImage?.secureUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.coverImage.secureUrl}
                    alt={featured.coverImage.altText || featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                )}
              </div>
              <span className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-amber-deep">
                {featured.category?.name || "Amakuru"}
              </span>
              <h1 className="mb-3 font-display text-[30px] font-semibold leading-tight text-ink group-hover:text-amber-deep sm:text-[38px]">
                {featured.title}
              </h1>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-charcoal">{featured.dek}</p>
              <span className="mt-3 block font-mono text-xs text-muted">
                {timeAgo(featured.publishedAt || featured.createdAt)} · {featured.readTimeMinutes} min read
              </span>
            </Link>

            <div className="flex flex-col gap-5 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted">Also today</h2>
              {sidePicks.map((a) => (
                <Link key={a._id} href={`/articles/${a.slug}`} className="group block border-b border-line pb-4 last:border-0">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-teal">
                    {a.category?.name || "Amakuru"}
                  </span>
                  <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-amber-deep">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category sections */}
      {categories.slice(0, 3).map((cat) => {
        const articles = sectionArticles[cat._id] || [];
        if (articles.length === 0) return null;
        return (
          <section key={cat._id} className="px-4 py-9 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <SectionHead
                label={cat.name}
                dotColor={SECTION_DOTS[cat.slug] || cat.colorDot || "#2F6F5E"}
                seeAllHref={`/category/${cat.slug}`}
              />
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {articles.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Newsletter */}
      <section className="grid grid-cols-1 border-t border-line lg:grid-cols-2">
        <NewsletterBox />
        <div className="flex flex-col justify-center bg-papyrus px-6 py-9 sm:px-8">
          <h2 className="mb-2.5 font-display text-2xl font-semibold text-ink">Explore every section</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-ink px-4 py-1.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
