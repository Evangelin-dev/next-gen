import Link from "next/link";

export const metadata = {
  title: "Refund Policy | The Bot",
  description: "Refund Policy for The Bot Agency.",
};

export default function RefundPolicyPage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="modal-kicker">THEBOT</p>
        <h1>Refund Policy</h1>
        <p className="legal-updated">Last updated: September 5, 2026</p>
        <p>This website is currently used to request information and schedule an introductory call. No payment is required to submit the enquiry form or schedule the introductory call.</p>
        <h2>Paid services</h2>
        <p>Any paid service, fee, cancellation period, or refund arrangement will be described in a separate written proposal, order, or service agreement before payment is requested.</p>
        <h2>Questions</h2>
        <p>For questions about a payment or service agreement, contact The Bot Agency using the business contact details supplied with your proposal or invoice.</p>
        <Link className="legal-back-link" href="/">Back to the website</Link>
      </article>
    </main>
  );
}