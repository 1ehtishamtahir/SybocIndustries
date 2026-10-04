import PageShell from "../../components/PageShell";
import QuoteForm from "../../components/QuoteForm";
import { Reveal, SplitLines } from "../../components/motion";
import { getSettings, getPublishedProducts, parseJson } from "../../lib/content";

export const metadata = {
  title: "Request a quote",
  description:
    "Trade pricing, lead times and volume breaks for dealers, race teams, schools and fleet buyers — quoted within one working day.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Request a quote | First Moto",
    description: "Tell us the model mix, quantities and delivery date.",
    url: "/quote",
  },
};

export default async function QuotePage() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  const notes = parseJson(settings["contact.notes"], []);
  const hours = parseJson(settings["contact.hours"], []);
  const email = settings["contact.email"];

  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <SplitLines as="h1">Request a trade quote</SplitLines>
          <p>Model mix, quantities and a delivery date. Pricing and lead time back within one working day.</p>
        </header>

        <div className="cols">
          <Reveal variant="left">
            <h2 className="sub">How a quote works</h2>
            <ul className="bullets">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>

            <h2 className="sub">Trade desk hours</h2>
            <ul className="bullets">
              {hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <p className="muted">
              Prefer email? Write to{" "}
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </Reveal>

          <Reveal variant="right" duration={1}>
            <QuoteForm products={products} />
          </Reveal>
        </div>
    </PageShell>
  );
}
