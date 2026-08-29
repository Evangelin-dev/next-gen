"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import apiClient from "../lib/api";
import { trackFacebookEvent } from "../lib/facebookPixel";

type Question = {
  title: string;
  options: string[];
};

type CalendarSlot = {
  start: string;
  end: string;
};

const WHATSAPP_NUMBER = "919892969648";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, my meeting has been booked. Please confirm the details.")}`;
const BUSINESS_URL = process.env.NEXT_PUBLIC_BUSINESS_URL || "https://thebotagency.com";

function getTodayInCalendarTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const questions: Question[] = [
  {
    title: "What best describes your business?",
    options: ["Manufacturer / OEM", "Manufacturer + Exporter", "Service Business"],
  },
  {
    title: "What is your biggest growth goal right now?",
    options: [
      "Generate more qualified B2B enquiries",
      "Generate export enquiries / enter international markets",
      "Build a predictable sales pipeline and increase revenue",
    ],
  },
  {
    title: "What is currently stopping you from achieving that growth?",
    options: [
      "Not enough qualified enquiries",
      "We get enquiries but struggle with positioning/conversion",
      "We don't have a predictable acquisition system",
    ],
  },
  {
    title: "What is your current annual turnover?",
    options: ["Below ₹5 Crore", "₹5–25 Crore", "₹25 Crore+"],
  },
  {
    title: "How soon do you want to solve this?",
    options: ["Immediately", "Within 3 months", "Just exploring"],
  },
  {
    title: "If we show you a strategy that makes sense for your business, how ready are you to implement it?",
    options: ["Ready to start immediately", "Ready if the strategy makes sense", "Not ready yet"],
  },
  {
    title: "If the right growth strategy requires investment, which best describes you?",
    options: [
      "Ready to invest if the opportunity makes sense",
      "Willing to invest, but need to understand the plan first",
      "Not looking to invest right now",
    ],
  },
];

export default function VideoExperience() {
  const [isApplyVisible, setIsApplyVisible] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [canSchedule, setCanSchedule] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayInCalendarTimezone);
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [booking, setBooking] = useState<{ meet_link?: string; start_time?: string } | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsApplyVisible(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isApplicationOpen) {
      questionRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isApplicationOpen, questionIndex]);

  useEffect(() => {
    if (!isComplete || !canSchedule) return;

    async function loadAvailability() {
      setIsLoadingSlots(true);
      setCalendarError("");
      setAvailableSlots([]);
      setSelectedSlot(null);
      try {
        const response = await apiClient.get<{ available_slots: CalendarSlot[] }>(
          `/google/calendar/availability?date=${selectedDate}&timezone=Asia/Kolkata`,
        );
        setAvailableSlots(response.data.available_slots || []);
      } catch (requestError) {
        const detail = axios.isAxiosError(requestError) && requestError.response?.data?.detail;
        setCalendarError(requestError && axios.isAxiosError(requestError) && requestError.response?.status === 500
          ? "The calendar is not connected yet. Please try again later."
          : typeof detail === "string" ? detail : "We could not load available times. Please try again.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    void loadAvailability();
  }, [canSchedule, isComplete, selectedDate]);

  useEffect(() => {
    if (!booking) return;

    trackFacebookEvent("WhatsAppContact", {
      content_name: "Post-booking WhatsApp handoff",
      content_category: "whatsapp",
      value: 1,
      currency: "INR",
    });
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    window.open(BUSINESS_URL, "_blank", "noopener,noreferrer");
  }, [booking]);

  function openApplication() {
    setIsApplicationOpen(true);
    setQuestionIndex(0);
    setSelectedOption("");
    setIsComplete(false);
    setCanSchedule(false);
    setAnswers({});
    setSaveError("");
    setBooking(null);
    setSelectedDate(getTodayInCalendarTimezone());
    setAvailableSlots([]);
    setCalendarError("");
    setSelectedSlot(null);
  }

  function chooseOption(option: string) {
    if (isChanging) return;
    setSelectedOption(option);
    setIsChanging(true);
    setSaveError("");
    const updatedAnswers = { ...answers, [question.title]: option };
    setAnswers(updatedAnswers);
    window.setTimeout(() => {
      void completeOrAdvance(updatedAnswers);
    }, 500);
  }

  async function completeOrAdvance(updatedAnswers: Record<string, string>) {
    if (questionIndex === questions.length - 1) {
      const roleQualified = localStorage.getItem("isQualified") !== "false";
      const isQualified = roleQualified
        && updatedAnswers[questions[questions.length - 1].title] !== "Not looking to invest right now";
      const interestId = localStorage.getItem("interestId");
      if (!interestId) {
        setSaveError("We could not find your application. Please return and submit your details again.");
        setIsChanging(false);
        return;
      }

      try {
        await apiClient.patch(`/interests/${interestId}`, {
          questionnaire_data: updatedAnswers,
          is_qualified: isQualified,
        });
        setCanSchedule(isQualified);
        setIsComplete(true);
        trackFacebookEvent("VideoCompletion", {
          content_name: "Application video completion",
          content_category: "qualification",
          value: isQualified ? 1 : 0,
          currency: "INR",
        });
      } catch (requestError) {
        const detail = axios.isAxiosError(requestError)
          && requestError.response?.data?.detail;
        setSaveError(typeof detail === "string" ? detail : "We could not save your answers. Please choose your answer again.");
      }
    } else {
      setQuestionIndex((current) => current + 1);
      setSelectedOption("");
    }
    setIsChanging(false);
  }

  async function bookSelectedSlot() {
    const interestId = localStorage.getItem("interestId");
    if (!interestId || !selectedSlot || isBooking) return;

    setIsBooking(true);
    setCalendarError("");
    try {
      const response = await apiClient.post<{ meet_link?: string; start_time?: string }>("/google/calendar/booking", {
        interest_id: interestId,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        timezone: "Asia/Kolkata",
      });
      await apiClient.patch(`/interests/${interestId}/update`, {
        meeting_date: response.data.start_time || selectedSlot.start,
        status: "meeting_booked",
      });
      trackFacebookEvent("Schedule", {
        content_name: "Booked growth call",
        content_category: "booking",
        value: 1,
        currency: "INR",
      });
      setBooking(response.data);
    } catch (requestError) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
      const detail = axios.isAxiosError(requestError) && requestError.response?.data?.detail;
      setCalendarError(status === 409
        ? "That time was just booked. Please choose another slot."
        : typeof detail === "string" ? detail : "We could not book that time. Please choose another slot.");
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

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, option: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseOption(option);
    }
  }

  const question = questions[questionIndex];

  return (
    <main className={`video-page ${isApplicationOpen ? "application-mode" : ""}`}>
      {!isApplicationOpen && (
        <section className="video-content">
          <div className="brand-mark" aria-label="The Bot">The Bot</div>
          <p className="modal-kicker">YOUR EXPORT GROWTH PLAN</p>
          <h1>Here&apos;s How Factories Can Build A Reliable Export Pipeline</h1>
          <p>Watch the video below to see how the guaranteed marketing funnel works.</p>
          <div className="video-frame">
            <video
              controls
              playsInline
              preload="metadata"
              src="https://bot-portal-bucket-2026.s3.ap-south-1.amazonaws.com/Full+VID.mp4"
              aria-label="The Bot export growth plan video"
              onEnded={() => {
                setIsApplyVisible(true);
                openApplication();
                trackFacebookEvent("VideoCompletion", {
                  content_name: "Landing page video completion",
                  content_category: "video",
                  value: 1,
                  currency: "INR",
                });
              }}
            />
          </div>
          <div className={`apply-reveal ${isApplyVisible ? "is-visible" : ""}`}>
            <button className="primary-button apply-button" onClick={openApplication}>APPLY NOW <span aria-hidden="true">→</span></button>
          </div>
        </section>
      )}

      {isApplicationOpen && (
        <section className="application-shell" aria-labelledby="application-title">
          <div className="application-topline" />
          <p className="modal-kicker">MANUFACTURER GROWTH PARTNER — QUALIFICATION</p>
          {!isComplete && <h1 id="application-title">Fill Out This Short Application Now</h1>}
          {!isComplete ? (
            <div className={`question-card ${isChanging ? "is-changing" : ""}`} ref={questionRef} tabIndex={-1}>
              <div className="question-meta"><span>{questionIndex + 1}</span><strong>of {questions.length}</strong></div>
              <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
              <p className="question-number">QUESTION {questionIndex + 1}</p>
              <h2>{question.title}</h2>
              <p className="question-hint">Select one answer to continue. Press Enter after choosing.</p>
              {saveError && <p className="form-error" role="alert">{saveError}</p>}
              <div className="answer-list">
                {question.options.map((option, index) => (
                  <button
                    className={`answer-button ${selectedOption === option ? "is-selected" : ""}`}
                    key={option}
                    onClick={() => chooseOption(option)}
                    onKeyDown={(event) => handleOptionKeyDown(event, option)}
                    disabled={isChanging}
                  >
                    <span className="answer-index">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    <span className="answer-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="calendly-placeholder">
              <div className="success-mark">✓</div>
              <p className="modal-kicker">APPLICATION COMPLETE</p>
              {!canSchedule ? (
                <>
                  <h2>Thanks for completing the application.</h2>
                  <p>We&apos;re unable to schedule a meeting at this time.</p>
                  <button className="secondary-button" onClick={() => setIsApplicationOpen(false)}>WATCH THE VIDEO AGAIN <span aria-hidden="true">→</span></button>
                </>
              ) : booking ? (
                <>
                  <h2>Your call is booked.</h2>
                  <p>The meeting invite has been sent to your email. We will continue on WhatsApp and our business page.</p>
                  <div className="cta-stack">
                    <a className="meet-link" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Open WhatsApp <span aria-hidden="true">→</span></a>
                    <a className="secondary-button" href={BUSINESS_URL} target="_blank" rel="noreferrer">Visit Business Page <span aria-hidden="true">→</span></a>
                  </div>
                </>
              ) : (
                <>
                  <h2>Choose a time that works for you.</h2>
                  <p>Available 30-minute slots are shown in India Standard Time.</p>
                  <div className="calendar-controls">
                    <label htmlFor="calendar-date">Choose a date</label>
                    <input id="calendar-date" type="date" value={selectedDate} min={getTodayInCalendarTimezone()} onChange={(event) => setSelectedDate(event.target.value)} />
                  </div>
                  {isLoadingSlots && <div className="calendar-loading"><span /> Loading available times...</div>}
                  {!isLoadingSlots && !calendarError && availableSlots.length === 0 && <p className="calendar-empty">No times are available on this date. Choose another date.</p>}
                  {calendarError && <p className="form-error" role="alert">{calendarError}</p>}
                  {!isLoadingSlots && availableSlots.length > 0 && (
                    <div className="slot-list" aria-label="Available times">
                      {availableSlots.map((slot) => (
                        <button className={`slot-button ${selectedSlot?.start === slot.start ? "is-selected" : ""}`} key={slot.start} onClick={() => setSelectedSlot(slot)}>{formatSlot(slot)}</button>
                      ))}
                    </div>
                  )}
                  <button className="primary-button book-button" disabled={!selectedSlot || isBooking} onClick={() => void bookSelectedSlot()}>{isBooking ? "BOOKING..." : "BOOK THIS TIME"}<span aria-hidden="true">→</span></button>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}