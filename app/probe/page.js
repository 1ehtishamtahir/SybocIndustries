import PageShell from "../../components/PageShell";
import QuoteForm from "../../components/QuoteForm";
import { getSettings, getPublishedProducts } from "../../lib/content";

export default async function Probe() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  return <PageShell mainClass="page"><header className="page-head"><p className="eyebrow">SYBOC / Enquiry</p><h1>Start a product enquiry</h1><p>Share your requirements and the trade team will help you shape the next step.</p></header><section className="probe-form"><QuoteForm products={products} contactEmail={settings["contact.email"] || "sybocindustry@gmail.com"} whatsapp={settings["contact.whatsapp"] || "923288166661"} /></section></PageShell>;
}

