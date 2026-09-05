import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | The Bot",
  description: "Privacy Policy for The Bot Agency.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <article className="legal-content">
        <p className="modal-kicker">THEBOT</p>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: September 5, 2026</p>
        <p>This starter policy explains how TheBot  collects and uses information submitted through this website.</p>
        <h2>Information we collect</h2>
        <p>We may collect your name, work email address, phone number, business details, questionnaire answers, and meeting preferences when you submit a form or book a call.</p>
        <h2>How we use information</h2>
        <p>We use this information to respond to enquiries, qualify requests, schedule meetings, provide requested resources, and improve our services. We may also use measurement tools such as the Meta Pixel to understand campaign performance.</p>
        <h2>Sharing and retention</h2>
        <p>We share information only with service providers needed to operate this website, manage enquiries, communicate with you, or schedule meetings. We retain information only as long as reasonably necessary for these purposes or as required by law.</p>
        <h2>Contact</h2>
        <p>For privacy questions or requests, contact The Bot Agency through the business contact details provided to you.</p>
        <Link className="legal-back-link" href="/">Back to the website</Link>
      </article>
    </main>
  );
}