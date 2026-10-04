import Link from "next/link";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getPublishedPosts } from "../../lib/content";

export const metadata = {
  title: "Blog",
  description: "Production notes, sizing guidance and track reports from the First Moto trade desk.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | First Moto",
    description: "Production notes, sizing guidance and track reports.",
    url: "/blog",
  },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <SplitLines as="h1">The journal</SplitLines>
        <p>Production notes, sizing and fitting guidance, certification updates and track days.</p>
      </header>

      {posts.length === 0 ? (
        <Reveal className="prose" duration={0.8}>
          <p>No posts published yet.</p>
        </Reveal>
      ) : (
        <Reveal className="cols" stagger={0.1} duration={0.8}>
          {posts.map((post) => (
            <article className="card-info" key={post.slug}>
              <p className="eyebrow">
                {fmt(post.publishedAt)}
                {post.category ? ` / ${post.category.name}` : ""}
              </p>
              <h2 className="sub">
                <Link href={`/blog/${post.slug}`} transitionTypes={["nav-forward"]}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && <p className="muted">{post.excerpt}</p>}
              <Link className="btn ghost" href={`/blog/${post.slug}`} transitionTypes={["nav-forward"]}>
                Read more
              </Link>
            </article>
          ))}
        </Reveal>
      )}
    </PageShell>
  );
}
