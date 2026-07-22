# Amakuru — gap-closing plan

Based on the actual code in `salvator12-web/amakuru` (cloned from `main`).
Two groups below: **files to update** (described, not fully rewritten —
they're small, targeted diffs) and **new files** (fully generated, included
alongside this plan).

---

## 1. New files (generated in full)

| File | What it does |
|---|---|
| `backend/src/models/AuditLog.ts` | New Mongoose model: `actor`, `action`, `targetType`, `targetId`, `meta`, `createdAt`. Generic so any staff action can be logged without a schema change. |
| `backend/src/services/auditLog.ts` | `recordAuditLog()` helper — fire-and-forget write, never throws into the caller. Call it from route handlers after a mutation succeeds. |
| `backend/src/routes/audit-log.ts` | `GET /api/audit-log` (Admin only, paginated, optional `?action=` filter). Feeds the existing "Coming soon" admin page. |
| `backend/src/middleware/rateLimit.ts` | `apiLimiter` / `authLimiter` / `writeLimiter` built on `express-rate-limit`, keyed by user id when authenticated, IP otherwise. |
| `frontend/components/admin/RichTextEditor.tsx` | Dependency-free `contentEditable` rich text editor (bold/italic/heading/quote/lists/link/undo-redo) — drop-in replacement for the body `<textarea>`. Emits the same HTML string `Article.body` already stores. |

---

## 2. Files that need updates (described, not rewritten)

### Backend

- **`backend/package.json`**
  Add `"express-rate-limit": "^7.4.1"` to `dependencies`. No other new deps needed — CSRF isn't actually applicable here (auth is `Authorization: Bearer <firebase-id-token>`, no cookies/sessions, so there's no ambient credential for a forged cross-site request to ride on). Worth stating explicitly in the README rather than leaving it as an open gap — the real gaps are rate limiting and audit logging, not CSRF.

- **`backend/src/server.ts`**
  - Import and mount `apiLimiter` globally (`app.use("/api", apiLimiter)`), `authLimiter` on `/api/auth`, `writeLimiter` on the two POST-heavy routers (`articlesRoutes`, `commentsRoutes`).
  - Import and mount the new `audit-log` router: `app.use("/api/audit-log", auditLogRoutes)`.

- **`backend/src/models/Article.ts`**
  Add two optional fields to `IArticle` and the schema: `seoTitle?: string` (max ~70 chars) and `seoDescription?: string` (max ~160 chars). Fall back to `title`/`dek` on the frontend when empty rather than making them required.

- **`backend/src/routes/articles.ts`**
  - Extend `ArticleInput`/`ArticleUpdateInput` zod schemas with `seoTitle: z.string().max(70).optional()` and `seoDescription: z.string().max(160).optional()`.
  - After a successful `POST /`, `PATCH /:id` (when status becomes `"published"`), and `DELETE /:id`, call `recordAuditLog({ actorId: String(req.user!._id), action: "article.create" | "article.publish" | "article.update" | "article.delete", targetType: "Article", targetId: String(article._id), meta: { slug: article.slug } })`.

- **`backend/src/routes/comments.ts`**
  After `PATCH /comments/:id` and `DELETE /comments/:id` succeed, call `recordAuditLog(...)` with `action: "comment.moderate"` / `"comment.delete"`.

- **`backend/src/routes/users.ts`**
  After `PATCH /:id/role` and `PATCH /:id/status` succeed, call `recordAuditLog(...)` with `action: "user.role_change"` / `"user.status_change"` and `meta: { from: <old value>, to: <new value> }` (fetch the doc before updating to capture `from`).

### Frontend

- **`frontend/components/admin/ArticleForm.tsx`**
  - Replace the plain `<textarea>` bound to `values.body` with `<RichTextEditor value={values.body} onChange={(html) => setValues(v => ({...v, body: html}))} />`.
  - Add two new fields under Dek: `SEO title` (text input, ~70-char counter) and `SEO description` (textarea, ~160-char counter), bound to `values.seoTitle` / `values.seoDescription`.
  - Add a `scheduledFor` `datetime-local` input, shown only when `values.status === "scheduled"`; also add "Scheduled" as a third option next to the existing Save-draft / Save-&-publish buttons (currently the form only ever submits `"draft"` or `"published"` — `"scheduled"` exists in the model and zod schema but nothing in the UI can set it).
  - Extend the local `ArticleFormValues` interface with `seoTitle?: string; seoDescription?: string;` (`scheduledFor` is already declared).

- **`frontend/lib/types.ts`**
  - Add `seoTitle?: string; seoDescription?: string;` to `ArticleDetail`.
  - Add a new `AuditLogEntry` interface: `{ _id: string; actor: { name: string; email: string; avatarUrl?: string }; action: string; targetType: string; targetId: string; meta?: Record<string, unknown>; createdAt: string; }`.

- **`frontend/app/admin/audit-log/page.tsx`**
  Replace the "Coming soon" placeholder with a real client component: fetch `GET /api/audit-log` via `authedFetch`, render a paginated table (actor, action, target, when), matching the style of the existing `ModerationQueue.tsx` table.

---

## 3. Confirmed (no code change needed, just documenting the answer)

- **Comment moderation is post-then-moderate**, not pre-moderate: `POST /api/articles/:id/comments` creates comments with `status: "approved"` immediately (`routes/comments.ts`), and the public `GET` only ever returns `status: "approved"`. The moderation queue (`GET /api/comments`) defaults to `?status=approved` for the same reason — it's reviewing what's already live, not gatekeeping a pending queue. This is already documented in `backend/README.md`; flagging it here since it was one of the five original open questions.
