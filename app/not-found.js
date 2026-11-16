import Link from "next/link";
import PageShell from "../components/PageShell";
import { SplitLines } from "../components/motion";

export default function NotFound() {
  return (
    <PageShell mainClass="page">
        <div className="notfound">
          <p className="crumb">SYBOC / Error 404</p>
          <SplitLines as="h1">Page not found</SplitLines>
          <p className="lede">The page you requested is not part of the current SYBOC INDUSTRIES catalogue.</p>
          <div className="row">
            <Link className="btn" href="/" transitionTypes={["nav-back"]}>
              Back to the start
            </Link>
            <Link className="btn ghost" href="/products" transitionTypes={["nav-forward"]}>
            View products
            </Link>
          </div>
        </div>
    </PageShell>
  );
}
