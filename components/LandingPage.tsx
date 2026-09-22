"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import apiClient from "../lib/api";
import { trackFacebookEvent } from "../lib/facebookPixel";


export default function LandingPage() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
 
  const [isQualified, setIsQualified] = useState(true);
  const [showQualificationNotice, setShowQualificationNotice] = useState(false);
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone || isSubmitting) {
      if (!phone) {
        setError("Please enter your phone number to continue.");
      }
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      first_name: formData.get("firstName"),
      email: formData.get("email"),
      phone: phone || "",
      role: formData.get("currentRole"),
      college : formData.get("college") || "",
      questionnaire_data: {
        current_role: formData.get("currentRole"),
      },
    };

    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post("/students/", payload);

      localStorage.setItem("studentId", String(data.id));
      localStorage.setItem("isQualified", String(isQualified));

      // Meta Pixel - Lead Event
      trackFacebookEvent("Lead", {
        content_name: "Career Assessment Form",
        current_role: formData.get("currentRole"),
      });

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
        <Image
        className="brand-mark"
        src="/logo.png"
        alt="The Bot"
        width={200}
        height={80}
        priority
      />
        <div className="hero-content">
          <p className="eyebrow">FOR STUDENTS</p>

        <h1>Unsure Which Career Path Is Right For You?</h1>

        <p className="hero-subtitle">
          Answer 8 simple questions and discover the type of work that naturally suits you.
        </p>

        <p className="hero-note">
          No marks. No right or wrong answers. Just honest answers about what you enjoy,
          what motivates you, and how you like to work.
        </p>

        <button
          className="primary-button hero-button"
          onClick={() => setIsFormOpen(true)}
        >
          TAKE THE QUICK ASSESSMENT <span aria-hidden="true">→</span>
        </button>
         
        </div>
      </section>

      <footer className="site-footer">
        { <p>© Next Genre Visions 2026</p> }
        <nav aria-label="Footer links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="/refund-policy">Refund Policy</a>
          <a href="/full-disclosure">Full Disclosure</a>
        </nav>
        <p>This site is not a part of the Facebook website or Facebook Inc.</p>
      </footer>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
          <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <button className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Close form">×</button>
            <p className="modal-kicker">YOUR EXPORT GROWTH PLAN</p>
            <h2 id="form-title"> Enter your info below and get started. Find out which skill suits you best!</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label><span>First name *</span><input name="firstName" type="text" placeholder="Enter your first name" required /></label>
                <label><span>Work email *</span><input name="email" type="email" placeholder="Enter your work email" required /></label>
                <label><span>Phone number *</span><PhoneInput name="phone" required defaultCountry="IN" value={phone} onChange={setPhone} placeholder="Enter your phone number" /></label>
                <label>
                <span>What best describes you currently? *</span>
                <select name="currentRole" required defaultValue="">
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="Student">Student</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Career Changer">Career Changer</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              </div>
          
              
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