import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "../../../components/PageShell";
import { Reveal, SplitLines } from "../../../components/motion";
import { getPublishedPost, getSettings } from "../../../lib/content";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found" };
  const settings = await getSettings();
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || settings["seo.description"],
    keywords: post.keywords || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.excerpt || undefined,
      url: `/blog/${post.slug}`,
      publishedTime: new Date(post.publishedAt).toISOString(),
    },
  };
}

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const settings = await getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: new Date(post.publishedAt).toISOString(),
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    publisher: { "@type": "Organization", name: settings["site.name"] || "First Moto" },
    mainEntityOfPage: `/blog/${post.slug}`,
  };

  return (
    <PageShell mainClass="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <p className="eyebrow">
          {fmt(post.publishedAt)}
          {post.category ? ` / ${post.category.name}` : ""}
        </p>
        <SplitLines as="h1">{post.title}</SplitLines>
        {post.excerpt && <p>{post.excerpt}</p>}
      </header>

      <Reveal className="prose" duration={0.8}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.tags.length > 0 && (
          <p className="muted">
            Filed under: {post.tags.map((t) => t.name).join(", ")}
          </p>
        )}
        <p>
          <Link className="btn ghost" href="/blog" transitionTypes={["nav-back"]}>
            All posts
          </Link>
        </p>
      </Reveal>
    </PageShell>
  );
}
