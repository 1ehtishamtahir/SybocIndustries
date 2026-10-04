import Link from "next/link";
import PageShell from "../components/PageShell";
import { SplitLines } from "../components/motion";

export default function NotFound() {
  return (
    <PageShell mainClass="page">
        <div className="notfound">
          <p className="crumb">Error 404</p>
          <SplitLines as="h1">Wrong turn</SplitLines>
          <p className="lede">That page went off track. The suits are still where you left them.</p>
          <div className="row">
            <Link className="btn" href="/" transitionTypes={["nav-back"]}>
              Back to the start
            </Link>
            <Link className="btn ghost" href="/suits" transitionTypes={["nav-forward"]}>
              See the suits
            </Link>
          </div>
        </div>
    </PageShell>
  );
}
