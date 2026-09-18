"use client";


import Image from "next/image";
import axios from "axios";
import apiClient from "../lib/api";

import React, { KeyboardEvent, useEffect, useRef, useState } from "react";



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
    title:
      "Imagine you are working in a company. Which activity sounds most exciting to you?",
    options: [
      "Promoting the company online and getting people to notice the brand",
      "Talking to people and helping them understand which career could suit them",
      "Working with a well-known builder and helping market their projects",
      "Finding ways to increase the company's sales and revenue",
      "Working behind the scenes and making sure everything runs smoothly",
    ],
  },
  {
    title:
      "Someone gives you a new business. What would you naturally want to do first?",
    options: [
      "Create social media content and promote it digitally",
      "Understand the people who might need its products or services",
      "Find a way to make the brand look attractive and trustworthy",
      "Find customers and figure out how to increase sales",
      "Understand the systems and processes needed to run the business",
    ],
  },
  {
    title: "Which conversation would you enjoy having?",
    options: [
      "“How can we make this brand go viral?”",
      "“What kind of career would actually suit this person?”",
      "“How can we make this real-estate project more attractive to buyers?”",
      "“Why are sales falling, and how can we increase revenue?”",
      "“How can we make the whole operation work better?”",
    ],
  },
  {
    title: "Which achievement would make you feel most proud?",
    options: [
      "“I helped thousands of people discover this brand.”",
      "“I helped someone find the right career direction.”",
      "“I helped a major builder successfully promote their project.”",
      "“I helped a business significantly increase its revenue.”",
      "“I built the system that made everything work efficiently.”",
    ],
  },
  {
    title: "What kind of work environment attracts you?",
    options: [
      "Fast-moving, creative and digital",
      "People-oriented, interactive and meaningful",
      "Professional, client-facing and connected to major projects",
      "Competitive, target-driven and focused on business growth",
      "Structured, technical and behind the scenes",
    ],
  },
  {
    title:
      "When you see a successful business, what are you most curious about?",
    options: [
      "“How did they build such a strong online presence?”",
      "“How did they find the right people for their team?”",
      "“How did they build such a powerful brand?”",
      "“How much revenue are they generating, and how can they grow further?”",
      "“What systems are running behind this business?”",
    ],
  },
  {
    title: "Which statement sounds most like you?",
    options: [
      "I like getting attention. I enjoy communication, creativity and making people notice something.",
      "I like understanding people. I enjoy listening, asking questions and helping people make decisions.",
      "I like working with influential brands and people. I want exposure to established businesses and major projects.",
      "I like making things grow. Targets, sales, revenue and business growth motivate me.",
      "I like making things work. I prefer planning, systems, technology and execution behind the scenes.",
    ],
  },
  {
    title:
      "If you could become really good at ONE thing, which would you choose?",
    options: [
      "Digital Marketing",
      "Counselling & Communication",
      "Branding & Client Management",
      "Sales & Business Growth",
      "Technology & Operations",
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
  const playerRef = useRef<HTMLElement | null>(null);
  const openApplicationRef = useRef(openApplication);

  useEffect(() => {
    openApplicationRef.current = openApplication;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsApplyVisible(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const bindVideo = (video: any) => {
      if (!video || video._hasEndBound) return;
      video._hasEndBound = true;
      video.bind("end", () => {
        openApplicationRef.current();
      });
      video.bind("percentwatchedchanged", (percent: number) => {
        if (percent >= 0.99) {
          openApplicationRef.current();
        }
      });
    };

    window._wq = window._wq || [];
    window._wq.push({ id: "_all", onReady: bindVideo });
    window._wq.push({ id: "id66qveamo", onReady: bindVideo });
  }, []);

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;

    const handleEnd = () => {
      openApplicationRef.current();
    };

    el.addEventListener("end", handleEnd);
    el.addEventListener("ended", handleEnd);

    return () => {
      el.removeEventListener("end", handleEnd);
      el.removeEventListener("ended", handleEnd);
    };
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

    
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    window.open(BUSINESS_URL, "_blank", "noopener,noreferrer");
  }, [booking]);

  function openApplication() {
    localStorage.removeItem("isQualified");
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
        localStorage.setItem("isQualified", String(isQualified));
        await apiClient.patch(`/interests/${interestId}`, {
          questionnaire_data: updatedAnswers,
          is_qualified: isQualified,
        });
        setCanSchedule(isQualified);
        setIsComplete(true);
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
      localStorage.setItem("isQualified", "true");
      await apiClient.patch(`/interests/${interestId}/update`, {
        meeting_date: response.data.start_time || selectedSlot.start,
        status: "meeting_booked",
        is_qualified: true,
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

  function goBackToLanding() {
    setIsApplicationOpen(false);
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
    setIsApplyVisible(true);
  }

  const question = questions[questionIndex];

  return (
    <main className={`video-page ${isApplicationOpen ? "application-mode" : ""}`}>
      {!isApplicationOpen && (
        <section className="video-content">
          <Image className="brand-mark" src="/logo.png" alt="The Bot" width={652} height={652} priority />
          <p className="modal-kicker">FOR STUDENTS</p>

        <h1>How I Started Building My Career One Skill at a Time</h1>

        <p>
          Watch this 1-minute video and discover how finding the right skill can help
          you create a career path that works for you.
        </p>
          <div className="video-frame">
          <video
            className="landing-video"
            controls
            playsInline
            preload="metadata"
            onEnded={openApplication}
          >
            <source src="/215475.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="assessment-prompt">
          Not sure which skill is right for you?
          <br />
          Take the quick assessment and discover where your strengths may fit.
        </p>
          <div className={`apply-reveal ${isApplyVisible ? "is-visible" : ""}`}>
            <button className="primary-button apply-button" onClick={openApplication}>
            TAKE THE QUICK ASSESSMENT <span aria-hidden="true">→</span>
          </button>
          </div>
        </section>
      )}

      {isApplicationOpen && (
        <section className="application-shell" aria-labelledby="application-title">
          <div className="application-topline" />
          <button type="button" className="landing-back-button" onClick={goBackToLanding} aria-label="Back to landing page">
            ← Back to landing
          </button>
          <p className="modal-kicker">STUDENT CAREER ASSESSMENT</p>
          {!isComplete && (
  <h1 id="application-title">Discover Which Skills Suit You Best</h1>
)}
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