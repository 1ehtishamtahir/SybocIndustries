"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RichText from "./RichText";

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function PageForm({ page = null }) {
  const router = useRouter();
  const editing = Boolean(page);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [excerpt, setExcerpt] = useState(page?.excerpt ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");
  const [keywords, setKeywords] = useState(page?.keywords ?? "");
  const [publish, setPublish] = useState(page?.status ?? "DRAFT");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      seoTitle,
      seoDescription,
      keywords,
      status: publish,
    };
    try {
      const res = await fetch(editing ? `/api/admin/pages/${page.id}` : "/api/admin/pages", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="form-row">
        <p className="field">
          <label htmlFor="page-title">Title</label>
          <input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slugTouched && !editing) setSlug(slugify(title));
            }}
            required
          />
        </p>
        <p className="field">
          <label htmlFor="page-slug">Slug (URL)</label>
          <input
            id="page-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder={slugify(title) || "page-url"}
          />
          <span className="hint">Public URL: /{slug || slugify(title) || "page-url"}</span>
        </p>
      </div>

      <p className="field">
        <label htmlFor="page-excerpt">Excerpt</label>
        <textarea id="page-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </p>

      <p className="field">
        <label>Content</label>
        <RichText value={content} onChange={setContent} placeholder="Write the page content..." />
      </p>

      <div className="form-row">
        <p className="field">
          <label htmlFor="page-seo-title">SEO meta title</label>
          <input id="page-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </p>
        <p className="field">
          <label htmlFor="page-status">Status</label>
          <select id="page-status" value={publish} onChange={(e) => setPublish(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </p>
      </div>

      <p className="field">
        <label htmlFor="page-seo-desc">SEO meta description</label>
        <textarea id="page-seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      </p>

      <p className="field">
        <label htmlFor="page-keywords">SEO keywords</label>
        <input id="page-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <span className="hint">Comma-separated.</span>
      </p>

      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : editing ? "Save changes" : "Create page"}
        </button>
        <button className="btn ghost dark" type="button" onClick={() => router.back()}>
          Cancel
        </button>
        {editing && page.status === "PUBLISHED" && (
          <a className="btn ghost dark" href={`/${page.slug}`} target="_blank" rel="noreferrer">
            View live ↗
          </a>
        )}
      </div>
    </form>
  );
}
