import Link from "next/link";

export const metadata = {
  title: "Full Disclosure | The Bot",
  description: "Full Disclosure for The Bot Agency.",
};

export default function FullDisclosurePage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="modal-kicker">THEBOT</p>
        <h1>Full Disclosure</h1>
        <p className="legal-updated">Last updated: September 5, 2026</p>
        <p>thebot provides marketing and growth services for businesses. Our programs are designed to support measurable business growth, with results dependent on the quality and consistency of implementation. Outcomes may vary based on the business, market, offer, sales process, budget, timing, team participation, and execution.</p>
        <h2>Results depend on implementation</h2>
        <p>thebot&apos;s programs and services are focused on implementation and practical execution. References to export enquiries, pipeline growth, revenue growth, or other business outcomes represent objectives, strategies, or examples of potential results and are not guaranteed outcomes. Individual results may vary.</p>
        <h2>Service Management</h2>
        <p>thebot is a brand operated and managed by Bot Digital Solutions Pvt. Ltd. The company manages the delivery and implementation of thebot&apos;s programs and services. The specific scope of implementation, responsibilities, deliverables, timelines, fees, and assumptions will be defined in the applicable proposal, agreement, or service document.</p>
        <h2>Independent Business</h2>
        <p>thebot and Bot Digital Solutions Pvt. Ltd. are independent businesses and are not affiliated with, sponsored by, or endorsed by Facebook, Meta Platforms, Inc., or any other third-party platform mentioned on this website.</p>
        <h2>Questions</h2>
        <p>Please review the specific scope, fees, assumptions, implementation responsibilities, and deliverables in writing before purchasing any service.</p>
        <Link className="legal-back-link" href="/">Back to the website</Link>
      </article>
    </main>
  );
}