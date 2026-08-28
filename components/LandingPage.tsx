"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import apiClient from "../lib/api";

const roleOptions = [
  "Factory owner",
  "Exporter",
  "Manufacturer",
  "Agency owner / Freelancer",
  "Consultant",
  "Other",
  "None of the above",
];

export default function LandingPage() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [role, setRole] = useState("");
  const [isQualified, setIsQualified] = useState(true);
  const [showQualificationNotice, setShowQualificationNotice] = useState(false);
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role || !phone || isSubmitting) {
      if (!role) {
        setError("Please choose an option to continue.");
      } else if (!phone) {
        setError("Please enter your phone number to continue.");
      }
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      first_name: formData.get("firstName"),
      email: formData.get("email"),
      phone: phone || null,
      role,
      other_role: role === "None of the above" ? formData.get("otherRole") : null,
      is_qualified: isQualified,
    };

    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<{ id: string }>("/interests", payload);
      localStorage.setItem("interestId", data.id);
      localStorage.setItem("isQualified", String(isQualified));
      router.push("/video");
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && !requestError.response) {
        setError("The CRM API could not be reached. Check the backend URL and CORS settings.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="landing-shell">
      <section className="hero-section">
        <div className="brand-mark" aria-label="The Bot">The Bot</div>
        <div className="hero-content">
          <p className="eyebrow">FOR FACTORY OWNERS ONLY</p>
          <h1>Get 10 Export Enquiries Every Month</h1>
          <p className="hero-subtitle">For Factory Owners Doing ₹5 Cr+ Annual Revenue &amp; Ready to Grow Through Exports.</p>
          <button className="primary-button hero-button" onClick={() => setIsFormOpen(true)}>
            Get Your Export Growth Plan <span aria-hidden="true">→</span>
          </button>
          <p className="hero-note">Only for established factories ready to explore international markets.</p>
        </div>
      </section>

      <footer className="site-footer">
        <p>© The Bot 2026</p>
        <nav aria-label="Footer links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms</a>
          <a href="#refund">Refund Policy</a>
          <a href="#disclosure">Full Disclosure</a>
        </nav>
        <p>This site is not a part of the Facebook website or Facebook Inc.</p>
      </footer>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
          <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <button className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Close form">×</button>
            <p className="modal-kicker">YOUR EXPORT GROWTH PLAN</p>
            <h2 id="form-title">Enter Your Info Below And We&apos;ll Send You A One-Pager On How Our Guaranteed Marketing Funnel Works.</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label><span>First name *</span><input name="firstName" type="text" placeholder="Enter your first name" required /></label>
                <label><span>Work email *</span><input name="email" type="email" placeholder="Enter your work email" required /></label>
                <label><span>Phone number *</span><PhoneInput name="phone" required defaultCountry="IN" value={phone} onChange={setPhone} placeholder="Enter your phone number" /></label>
                <label>
                  <span>Please describe what you do currently? *</span>
                    <select value={role} onChange={(event) => {
                      const selectedRole = event.target.value;
                      const qualifiesByRole = ["Factory owner", "Exporter", "Manufacturer"].includes(selectedRole);
                      setRole(selectedRole);
                      setIsQualified(qualifiesByRole);
                      setShowQualificationNotice(!qualifiesByRole);
                      setError("");
                    }} required>
                    <option value="" disabled>Select an option</option>
                    {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
              {role === "None of the above" && <label><span>Please specify *</span><input name="otherRole" type="text" placeholder="Please specify" required /></label>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "SUBMITTING..." : "WATCH NOW FOR FREE"} <span aria-hidden="true">→</span></button>
              <p className="consent-copy">By submitting this form, you agree to be contacted about your export growth plan.</p>
            </form>
          </section>
        </div>
      )}

      {showQualificationNotice && (
        <div className="modal-backdrop qualification-backdrop" role="presentation">
          <section className="qualification-modal" role="dialog" aria-modal="true" aria-labelledby="qualification-title">
            <div className="qualification-icon" aria-hidden="true">!</div>
            <p className="modal-kicker">PROGRAM ELIGIBILITY</p>
            <h2 id="qualification-title">Sorry, this is exclusive for <strong>Factory Owners &amp; Manufacturers</strong></h2>
            <div className="qualification-divider" aria-hidden="true"><span />•••<span /></div>
            <p>Our program is designed specifically for factory owners and manufacturers who are looking to grow their export business.</p>
            <p>If this changes, we&apos;ll be happy to welcome you.</p>
            <button className="secondary-button" onClick={() => setShowQualificationNotice(false)}>CONTINUE ANYWAY <span aria-hidden="true">→</span></button>
          </section>
        </div>
      )}
    </main>
  );
}