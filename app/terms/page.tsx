import Link from "next/link";

export const metadata = {
  title: "Terms |Next Genre Vision ",
  description: "Terms of Use for Next Genre Vision .",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="modal-kicker">Next Genre Vision </p>
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: September 5, 2026</p>
        <p>By using this website or submitting your details, you agree to use the website lawfully and to provide information that is accurate and current.</p>
        <h2>Website information</h2>
        <p>Our content is provided for general business and educational information. It is not a guarantee of results, legal advice, financial advice, or a promise of a specific number of enquiries or revenue.</p>
        <h2>Communication</h2>
        <p>When you submit your details, you agree that Next Genre Vision may contact you about your enquiry, requested resources, services, and scheduled meetings. You may ask us to stop marketing communications at any time.</p>
        <h2>Changes</h2>
        <p>We may update these terms as the website or our services change. The latest version will be published on this page.</p>
        <Link className="legal-back-link" href="/">Back to the website</Link>
      </article>
    </main>
  );
}