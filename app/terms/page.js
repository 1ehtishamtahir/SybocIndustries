import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";

export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for using the SYBOC INDUSTRIES website and placing product enquiries.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms and Conditions | SYBOC INDUSTRIES", description: "Website and enquiry terms.", url: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <SplitLines as="h1">Terms and Conditions</SplitLines>
        <p>These terms explain how the SYBOC INDUSTRIES website and product enquiries are intended to be used.</p>
      </header>
      <Reveal className="prose" duration={0.8}>
        <h2>Website information</h2>
        <p>Product descriptions, colours, availability and imagery are provided for general information and may change as collections develop. A product enquiry does not create a confirmed order.</p>
        <h2>Orders and quotations</h2>
        <p>Prices, minimum quantities, lead times and delivery terms are confirmed in writing for each order. An order is accepted only after the relevant quotation and terms have been agreed.</p>
        <h2>Product use</h2>
        <p>Customers are responsible for selecting products appropriate to their intended use and for following all care, sizing and safety guidance supplied with a product.</p>
        <h2>Intellectual property</h2>
        <p>All site copy, branding, graphics and original product presentation belong to SYBOC INDUSTRIES or its licensors and may not be reused without written permission.</p>
        <h2>Contact</h2>
        <p>For questions about these terms or a product enquiry, contact the SYBOC INDUSTRIES trade desk.</p>
      </Reveal>
    </PageShell>
  );
}
