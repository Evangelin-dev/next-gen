"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import apiClient from "../lib/api";

type CalendarSlot = {
  start: string;
  end: string;
};

type BookingResponse = {
  meet_link?: string;
  start_time?: string;
};

const WHATSAPP_NUMBER = "919892969648";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, my meeting has been booked. Please confirm the details.")}`;
const BUSINESS_URL = process.env.NEXT_PUBLIC_BUSINESS_URL || "https://thebotagency.com";

const roleOptions = [
  "Factory owner",
  "Exporter",
  "Manufacturer",
  "Agency owner / Freelancer",
  "Consultant",
  "Other",
  "None of the above",
];

function getTodayInCalendarTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getRequestError(error: unknown, fallback: string) {
  const detail = axios.isAxiosError(error) && error.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

type DirectSchedulerProps = {
  initialInterestId?: string;
};

export default function DirectScheduler({ initialInterestId }: DirectSchedulerProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [role, setRole] = useState("");
  const [interestId, setInterestId] = useState<string | null>(initialInterestId || null);
  const [isRescheduling] = useState(Boolean(initialInterestId));
  const [stage, setStage] = useState<"form" | "calendar" | "complete" | "disqualified">("form");
  const [selectedDate, setSelectedDate] = useState(getTodayInCalendarTimezone);
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage !== "calendar") return;

    async function loadAvailability() {
      setIsLoadingSlots(true);
      setError("");
      setAvailableSlots([]);
      setSelectedSlot(null);
      try {
        const response = await apiClient.get<{
          date?: string;
          recommended_date?: string;
          available_slots: CalendarSlot[];
        }>(
          `/google/calendar/availability?date=${selectedDate}&timezone=Asia/Kolkata`,
        );
        if (response.data.date && response.data.date !== selectedDate) {
          setSelectedDate(response.data.date);
        }
        setAvailableSlots(response.data.available_slots || []);
      } catch (requestError) {
        setError(getRequestError(requestError, "We could not load available times. Please try again."));
      } finally {
        setIsLoadingSlots(false);
      }
    }

    void loadAvailability();
  }, [selectedDate, stage]);

  useEffect(() => {
    if (!booking) return;

    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    window.open(BUSINESS_URL, "_blank", "noopener,noreferrer");
  }, [booking]);

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone || isSubmitting) {
      if (!phone) setError("Please enter your phone number to continue.");
      return;
    }

    const isQualified = ["Factory owner", "Exporter", "Manufacturer"].includes(role);
    setError("");
    setIsSubmitting(true);
    try {
      let currentInterestId = interestId;
      if (currentInterestId) {
        await apiClient.patch(`/interests/${currentInterestId}/update`, {
          first_name: firstName,
          email,
          phone,
          role,
          is_qualified: isQualified,
        });
      } else {
        const { data } = await apiClient.post<{ id: string }>("/interests", {
          first_name: firstName,
          email,
          phone,
          role,
          other_role: role === "None of the above" ? null : null,
          is_qualified: isQualified,
        });
        currentInterestId = data.id;
        setInterestId(data.id);
      }

      if (!currentInterestId) throw new Error("Missing CRM lead id.");
      localStorage.setItem("interestId", currentInterestId);
      localStorage.setItem("isQualified", String(isQualified));
      setStage(isQualified ? "calendar" : "disqualified");
    } catch (requestError) {
      setError(getRequestError(requestError, "We could not save your details. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function bookSelectedSlot() {
    if (!interestId || !selectedSlot || isBooking) return;

    setIsBooking(true);
    setError("");
    try {
      const response = await apiClient.post<BookingResponse>("/google/calendar/booking", {
        interest_id: interestId,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        timezone: "Asia/Kolkata",
      });
      await apiClient.patch(`/interests/${interestId}/update`, {
        meeting_date: response.data.start_time || selectedSlot.start,
        status: isRescheduling ? "meeting_rescheduled" : "meeting_booked",
      });
      setBooking(response.data);
      setStage("complete");
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && requestError.response?.status === 409
        ? "That time was just booked. Please choose another slot."
        : getRequestError(requestError, "We could not book that time. Please choose another slot."));
      setSelectedSlot(null);
    } finally {
      setIsBooking(false);
    }
  }

  function formatSlot(slot: CalendarSlot) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(slot.start));
  }

  return (
    <main className="schedule-page">
      <section className="schedule-shell">
        <Image className="schedule-logo" src="/logo.png" alt="The Bot" width={512} height={512} priority />
        {stage === "form" && (
          <>
            <p className="modal-kicker">{isRescheduling ? "RESCHEDULE YOUR CALL" : "BOOK YOUR GROWTH CALL"}</p>
            <h1>{isRescheduling ? "Choose a new time for your call" : "Schedule your export growth call"}</h1>
            <p className="schedule-intro">Enter your details below and choose a time that works for you.</p>
            <form className="schedule-form" onSubmit={handleDetailsSubmit}>
              <label><span>First name *</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} type="text" placeholder="Enter your first name" required /></label>
              <label><span>Work email *</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Enter your work email" required /></label>
              <label><span>Phone number *</span><PhoneInput name="phone" required defaultCountry="IN" value={phone} onChange={setPhone} placeholder="Enter your phone number" /></label>
              <label><span>What best describes your business? *</span><select value={role} onChange={(event) => setRole(event.target.value)} required><option value="" disabled>Select an option</option>{roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "SAVING..." : "CONTINUE TO SCHEDULE"}<span aria-hidden="true">→</span></button>
            </form>
          </>
        )}
        {stage === "calendar" && (
          <div className="schedule-calendar">
            <p className="modal-kicker">CHOOSE A TIME</p>
            <h1>{isRescheduling ? "Choose a new time for your call" : "Choose a time that works for you"}</h1>
            <p className="schedule-intro">Available 30-minute slots are shown in India Standard Time.</p>
            <div className="calendar-controls"><label htmlFor="schedule-date">Choose a date</label><input id="schedule-date" type="date" value={selectedDate} min={getTodayInCalendarTimezone()} onChange={(event) => setSelectedDate(event.target.value)} /></div>
            {isLoadingSlots && <div className="calendar-loading"><span /> Loading available times...</div>}
            {!isLoadingSlots && !error && availableSlots.length === 0 && <p className="calendar-empty">No times are available on this date. Choose another date.</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
            {!isLoadingSlots && availableSlots.length > 0 && <div className="slot-list" aria-label="Available times">{availableSlots.map((slot) => <button className={`slot-button ${selectedSlot?.start === slot.start ? "is-selected" : ""}`} key={slot.start} onClick={() => setSelectedSlot(slot)}>{formatSlot(slot)}</button>)}</div>}
            <button className="primary-button book-button" disabled={!selectedSlot || isBooking} onClick={() => void bookSelectedSlot()}>{isBooking ? "BOOKING..." : isRescheduling ? "RESCHEDULE CALL" : "BOOK THIS TIME"}<span aria-hidden="true">→</span></button>
          </div>
        )}
        {stage === "disqualified" && (
          <div className="schedule-result"><div className="success-mark">✓</div><p className="modal-kicker">DETAILS RECEIVED</p><h1>Thanks for your interest.</h1><p>We&apos;re unable to schedule a meeting at this time.</p></div>
        )}
        {stage === "complete" && booking && (
          <div className="schedule-result">
            <div className="success-mark">✓</div>
            <p className="modal-kicker">{isRescheduling ? "CALL RESCHEDULED" : "CALL BOOKED"}</p>
            <h1>{isRescheduling ? "Your call has been rescheduled." : "Your call is booked."}</h1>
            <p>The meeting invite has been sent to your email. We will continue on WhatsApp and our business page.</p>
            <div className="cta-stack">
              <a className="meet-link" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Open WhatsApp <span aria-hidden="true">→</span></a>
              <a className="secondary-button" href={BUSINESS_URL} target="_blank" rel="noreferrer">Visit Business Page <span aria-hidden="true">→</span></a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
