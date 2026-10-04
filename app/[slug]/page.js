import { notFound } from "next/navigation";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getPublishedPage, getSettings } from "../../lib/content";

// CMS-managed content pages created in /admin (e.g. /trade-terms). Static
// routes like /why and /suits take precedence over this dynamic segment.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return {};
  const settings = await getSettings();
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || settings["seo.description"],
    keywords: page.keywords || undefined,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: "website",
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || undefined,
      url: `/${page.slug}`,
    },
  };
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <SplitLines as="h1">{page.title}</SplitLines>
        {page.excerpt && <p>{page.excerpt}</p>}
      </header>

      <Reveal className="prose" duration={0.8}>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </Reveal>
    </PageShell>
  );
}
