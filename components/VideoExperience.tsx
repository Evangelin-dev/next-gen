"use client";

import Script from "next/script";
import Image from "next/image";
import apiClient from "../lib/api";
import { trackFacebookEvent } from "../lib/facebookPixel";

import React, {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Question = {
  title: string;
  options: string[];
};

const WHATSAPP_NUMBER = "919167727792";

function getTodayInCalendarTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatSelectedTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

const collegeOptions = [
  "Manohar Joshi, Sion",
  "Mumbai Management, Mira Road",
  "Indo Scot, Thane",
  "Goenka, Dombivali",
  "Vivekanand, Kopar Khairane",
  "Indala, Kalyan",
  "Online Campus",
];

/* Available counselling time slots */
const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
];

const questions: Question[] = [
  {
    title:
      "Imagine you are launching a new business. What would you enjoy doing most?",
    options: [
      "Creating ideas, content and campaigns that get people's attention.",
      "Talking to customers, understanding their needs and helping the business grow.",
    ],
  },
  {
    title:
      "A business is getting visitors but not enough customers. Which challenge would interest you more?",
    options: [
      "Finding better ways to attract the right audience and build the brand.",
      "Finding out why people are not buying and improving sales.",
    ],
  },
  {
    title:
      "Which type of task would you naturally enjoy more?",
    options: [
      "Communicating with people, presenting ideas and building relationships.",
      "Working with technology, systems, data and solving practical problems.",
    ],
  },
  {
    title:
      "Which result would give you the most satisfaction?",
    options: [
      "Seeing a campaign become popular and people connect with the brand.",
      "Seeing a business gain more customers, sales and growth.",
    ],
  },
  {
    title:
      "Which skill would you most like to become really good at?",
    options: [
      "Content, communication and digital marketing.",
      "Sales, technology and business problem-solving.",
    ],
  },
  {
    title:
      "If you joined a new company tomorrow, which role would you be more excited to try?",
    options: [
      "Helping with marketing, content, communication and brand building.",
      "Helping with sales, technology, operations and business growth.",
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
  const [isCollegeSaved, setIsCollegeSaved] = useState(false);

  const [selectedCollege, setSelectedCollege] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  const questionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsApplyVisible(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isApplicationOpen) return;

    questionRef.current?.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isApplicationOpen, questionIndex]);

  function openApplication() {
    setIsApplicationOpen(true);

    setQuestionIndex(0);
    setSelectedOption("");

    setIsComplete(false);
    setIsCollegeSaved(false);

    setAnswers({});
    setSelectedCollege("");

    setSelectedDate("");
    setSelectedTime("");

    setIsBooking(false);
    setBookingError("");
    setIsBookingComplete(false);
  }

  function chooseOption(option: string) {
    if (isChanging) return;

    setSelectedOption(option);
    setIsChanging(true);

    const updatedAnswers = {
      ...answers,
      [questions[questionIndex].title]: option,
    };

    setAnswers(updatedAnswers);

    window.setTimeout(() => {
      completeOrAdvance(updatedAnswers);
    }, 500);
  }

  function completeOrAdvance(
    updatedAnswers: Record<string, string>
  ) {
    setAnswers(updatedAnswers);

    if (questionIndex === questions.length - 1) {
      setIsComplete(true);
    } else {
      setQuestionIndex((current) => current + 1);
      setSelectedOption("");
    }

    setIsChanging(false);
  }

  async function handleCollegeSubmit() {
    if (!selectedCollege) return;

    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      console.error("Student ID not found");
      setBookingError(
        "Student record not found. Please try again."
      );
      return;
    }

    try {
      setBookingError("");

      const eventId = crypto.randomUUID();

      await apiClient.patch(`/students/${studentId}/`, {
        college: selectedCollege,
        questionnaire_data: {
          questions: questions.map((question) => ({
            question: question.title,
            answer: answers[question.title] || "",
          })),
        },
        event_id: eventId,
        event_name: "VideoCompletion",
      });

      setIsCollegeSaved(true);

      trackFacebookEvent(
        "VideoCompletion",
        {
          content_name: "Career Questionnaire",
          status: "completed",
        },
        eventId
      );
    } catch (error) {
      console.error(
        "Failed to save questionnaire:",
        error
      );

      setBookingError(
        "We could not save your details. Please try again."
      );
    }
  }

  async function confirmBooking() {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      setBookingError("Student record not found.");
      return;
    }

    if (!selectedCollege || !selectedDate || !selectedTime) {
      setBookingError(
        "Please select college, date and time."
      );
      return;
    }

    if (
      selectedTime < "10:00" ||
      selectedTime > "18:00"
    ) {
      setBookingError(
        "Please select a time between 10:00 AM and 6:00 PM."
      );
      return;
    }

    if (isBooking) return;

    setIsBooking(true);
    setBookingError("");

    const formattedTime =
      formatSelectedTime(selectedTime);

    const whatsappMessage = `You're all set!
Your counselling appointment has been successfully saved.

College: ${selectedCollege}
Date: ${selectedDate}
Booked Time: ${formattedTime}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    const whatsappWindow = window.open(
      "about:blank",
      "_blank"
    );

    if (whatsappWindow) {
      whatsappWindow.document.write(
        "<p style='font-family:Arial;text-align:center;margin-top:50px;'>Opening WhatsApp...</p>"
      );
    }

    try {
      const eventId = crypto.randomUUID();

      await apiClient.patch(`/students/${studentId}/`, {
        college: selectedCollege,
        booking_date: selectedDate,
        booking_time: formattedTime,
        event_id: eventId,
        event_name: "Schedule",
      });

      setIsBookingComplete(true);

      trackFacebookEvent(
        "Schedule",
        {
          content_name: "Career Assessment Booking",
          booking_date: selectedDate,
          booking_time: formattedTime,
          status: "booked",
        },
        eventId
      );

      if (
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.location.href = whatsappUrl;
      }
    } catch (error) {
      console.error("Booking failed:", error);

      if (
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.close();
      }

      setBookingError(
        "Booking could not be saved. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    option: string
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      chooseOption(option);
    }
  }

  function goBackToLanding() {
    setIsApplicationOpen(false);

    setQuestionIndex(0);
    setSelectedOption("");

    setIsComplete(false);
    setIsCollegeSaved(false);

    setAnswers({});
    setSelectedCollege("");

    setSelectedDate("");
    setSelectedTime("");

    setIsBooking(false);
    setBookingError("");
    setIsBookingComplete(false);

    setIsApplyVisible(true);
  }

  const question = questions[questionIndex];

  return (
    <>
      {/* Wistia scripts */}
      <Script
        src="https://fast.wistia.com/player.js"
        strategy="afterInteractive"
      />

      <Script
        src="https://fast.wistia.com/embed/9p3ex5dzmq.js"
        type="module"
        strategy="afterInteractive"
      />

      <main
        className={`video-page ${
          isApplicationOpen
            ? "application-mode"
            : ""
        }`}
      >
        {/* VIDEO PAGE */}
        {!isApplicationOpen && (
          <section className="video-content">
            <Image
              className="brand-mark"
              src="/logo.png"
              alt="The Bot"
              width={652}
              height={652}
              priority
            />

            <p className="modal-kicker">
              Student Career Discovery
            </p>

            <h1>
              How I Started Building My Career One
              Skill at a Time
            </h1>

            <p>
              Watch this 1-minute video and discover
              how finding the right skill can help you
              create a career path that works for you.
            </p>

            {/* Wistia Video */}
            <div className="video-frame">
              <wistia-player
                media-id="9p3ex5dzmq"
                aspect="1.7777777777777777"
              />
            </div>

            <p className="assessment-prompt">
              Not sure which skill is right for you?
              <br />
              Take the quick assessment and discover
              where your strengths may fit.
            </p>

            <div
              className={`apply-reveal ${
                isApplyVisible
                  ? "is-visible"
                  : ""
              }`}
            >
              <button
                type="button"
                className="primary-button apply-button"
                onClick={openApplication}
              >
                TAKE THE QUICK ASSESSMENT
                <span aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </section>
        )}

        {/* ASSESSMENT */}
        {isApplicationOpen && (
          <section
            className="application-shell"
            aria-labelledby="application-title"
          >
            <div className="application-topline" />

            <button
              type="button"
              className="landing-back-button"
              onClick={goBackToLanding}
              aria-label="Back to landing page"
            >
              ← Back to landing
            </button>

            <p className="modal-kicker">
              Student Career Discovery
            </p>

            {/* QUESTION HEADER */}
            {!isComplete && (
               <h1 id="application-title">
                 Discover Which Skills Suit You Best
              </h1>
            )}

            {/* QUESTIONS */}
            {!isComplete ? (
              <div
                className={`question-card ${
                  isChanging
                    ? "is-changing"
                    : ""
                }`}
                ref={questionRef}
                tabIndex={-1}
              >
                <div className="question-meta">
                  <span>
                    {questionIndex + 1}
                  </span>

                  <strong>
                    of {questions.length}
                  </strong>
                </div>

                <div className="progress-track">
                  <span
                    style={{
                      width: `${
                        ((questionIndex + 1) /
                          questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <p className="question-number">
                  QUESTION {questionIndex + 1}
                </p>

                <h2>{question.title}</h2>

                <p className="question-hint">
                  Choose the option that feels most like
                  you.
                </p>

                <div className="answer-list">
                  {question.options.map(
                    (option, index) => (
                      <button
                        type="button"
                        className={`answer-button ${
                          selectedOption === option
                            ? "is-selected"
                            : ""
                        }`}
                        key={option}
                        onClick={() =>
                          chooseOption(option)
                        }
                        onKeyDown={(event) =>
                          handleOptionKeyDown(
                            event,
                            option
                          )
                        }
                        disabled={isChanging}
                      >
                        <span className="answer-index">
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <span>{option}</span>

                        <span
                          className="answer-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* BOOKING */
              <div
                className="calendly-placeholder"
                style={{
                  width: "min(100%, 760px)",
                  margin: "16px auto 0",
                  padding: "42px 52px 46px",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                {!isBookingComplete ? (
                  <>
                    <div className="success-mark">
                      ✓
                    </div>

                    <p
                      className="modal-kicker"
                      style={{
                        margin: "0 0 8px",
                        letterSpacing: "0.18em",
                      }}
                    >
                      NEXT STEP
                    </p>

                    <h2
                      style={{
                        margin: "0 auto 12px",
                        lineHeight: 1.2,
                      }}
                    >
                      Book Your Counselling Session
                    </h2>

                    <p
                      className="question-hint"
                      style={{
                        maxWidth: "600px",
                        margin: "0 auto 32px",
                        lineHeight: 1.55,
                      }}
                    >
                      Great job! Your assessment is complete.
                      <br />
                      Now choose a counselling centre and book a
                      convenient time.
                    </p>

                    {/* COLLEGE */}
                    {!isCollegeSaved ? (
                      <>
                        <p
                          className="question-number"
                          style={{
                            margin: "8px 0 8px",
                            fontSize: "0.78rem",
                            letterSpacing: "0.16em",
                            lineHeight: 1.3,
                          }}
                        >
                          1. SELECT COUNSELLING CENTRE
                        </p>

                        <p
                          className="question-hint"
                          style={{
                            margin: "0 auto 16px",
                            lineHeight: 1.5,
                          }}
                        >
                          Choose the counselling centre
                          you'd like to visit.
                        </p>

                        <label
                          className="college-select-label"
                          style={{
                            display: "block",
                            width: "min(100%, 520px)",
                            margin: "0 auto",
                          }}
                        >
                          <select
                            name="college"
                            value={selectedCollege}
                            onChange={(event) => {
                              setSelectedCollege(
                                event.target.value
                              );
                              setBookingError("");
                            }}
                            style={{
                              width: "100%",
                              minHeight: "52px",
                              boxSizing: "border-box",
                              padding: "0 14px",
                            }}
                          >
                            <option
                              value=""
                              disabled
                            >
                              Select counselling centre
                            </option>

                            {collegeOptions.map(
                              (college) => (
                                <option
                                  key={college}
                                  value={college}
                                >
                                  {college}
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        {selectedCollege && (
                          <button
                            type="button"
                            className="primary-button book-button"
                            style={{
                              minHeight: "50px",
                              margin: "24px auto 0",
                            }}
                            onClick={() =>
                              void handleCollegeSubmit()
                            }
                          >
                            CONTINUE TO DATE & TIME
                            <span aria-hidden="true">
                              →
                            </span>
                          </button>
                        )}

                        {bookingError && (
                          <p
                            className="form-error"
                            role="alert"
                          >
                            {bookingError}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {/* SELECTED COLLEGE */}
                        <p
                          className="question-number"
                          style={{
                            margin: "8px 0 8px",
                            fontSize: "0.78rem",
                            letterSpacing: "0.16em",
                            lineHeight: 1.3,
                          }}
                        >
                          1. COUNSELLING CENTRE
                        </p>

                        <p
                          className="question-hint"
                          style={{
                            margin: "0 auto 16px",
                            lineHeight: 1.5,
                          }}
                        >
                          Selected centre:{" "}
                          <strong>
                            {selectedCollege}
                          </strong>
                        </p>

                        {/* DATE */}
                        <p
                          className="question-number"
                          style={{
                            margin: "32px 0 10px",
                            fontSize: "0.78rem",
                            letterSpacing: "0.16em",
                            lineHeight: 1.3,
                          }}
                        >
                          2. CHOOSE YOUR DATE
                        </p>

                        <div
                          className="calendar-controls"
                          style={{
                            width: "min(100%, 520px)",
                            margin: "0 auto 24px",
                          }}
                        >
                          <label htmlFor="counselling-date">
                            Select a convenient date
                          </label>

                          <input
                            id="counselling-date"
                            type="date"
                            value={selectedDate}
                            min={getTodayInCalendarTimezone()}
                            onChange={(event) => {
                              setSelectedDate(
                                event.target.value
                              );
                              setSelectedTime("");
                              setBookingError("");
                            }}
                            style={{
                              width: "100%",
                              minHeight: "52px",
                              boxSizing: "border-box",
                              padding: "0 14px",
                            }}
                          />
                        </div>

                        {/* TIME SLOTS */}
                        {selectedDate && (
                          <>
                            <p
                              className="question-number"
                              style={{
                                margin: "28px 0 10px",
                                fontSize: "0.78rem",
                                letterSpacing: "0.16em",
                                lineHeight: 1.3,
                              }}
                            >
                              3. CHOOSE YOUR TIME
                            </p>

                            <p
                              className="question-hint"
                              style={{
                                margin: "0 auto 18px",
                                lineHeight: 1.5,
                              }}
                            >
                              Select a convenient time
                              for your session.
                            </p>

                            <div
                              style={{
                                width: "min(100%, 560px)",
                                margin: "0 auto",
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(140px, 1fr))",
                                gap: "10px",
                              }}
                            >
                              {timeSlots.map(
                                (time) => {
                                  const isSelected =
                                    selectedTime ===
                                    time;

                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => {
                                        setSelectedTime(
                                          time
                                        );
                                        setBookingError(
                                          ""
                                        );
                                      }}
                                      style={{
                                        minHeight: "48px",
                                        padding:
                                          "10px 12px",
                                        border: isSelected
                                          ? "1.5px solid #1298e8"
                                          : "1px solid #cbdceb",
                                        borderRadius:
                                          "7px",
                                        background:
                                          isSelected
                                            ? "#eef8ff"
                                            : "#ffffff",
                                        color:
                                          isSelected
                                            ? "#128fd6"
                                            : "#111827",
                                        fontWeight: 600,
                                        fontSize: "15px",
                                        cursor:
                                          "pointer",
                                        transition:
                                          "all 0.2s ease",
                                      }}
                                    >
                                      {formatSelectedTime(
                                        time
                                      )}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </>
                        )}

                        {/* ERROR */}
                        {bookingError && (
                          <p
                            className="form-error"
                            role="alert"
                          >
                            {bookingError}
                          </p>
                        )}

                        {/* CONFIRM */}
                        <button
                          type="button"
                          className="primary-button book-button"
                          disabled={
                            !selectedDate ||
                            !selectedTime ||
                            isBooking
                          }
                          onClick={() =>
                            void confirmBooking()
                          }
                          style={{
                            minHeight: "50px",
                            margin: "28px auto 0",
                          }}
                        >
                          {isBooking
                            ? "SAVING..."
                            : "BOOK THIS TIME"}

                          <span aria-hidden="true">
                            →
                          </span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  /* BOOKING SUCCESS */
                  <div className="schedule-result">
                    <div className="success-mark">
                      ✓
                    </div>

                    <p className="modal-kicker">
                      APPOINTMENT BOOKED
                    </p>

                    <h2>
                      You're all set!
                    </h2>

                    <p className="question-hint">
                      Your counselling appointment
                      has been successfully saved.
                    </p>

                    <div className="booking-summary">
                      <p>
                        <strong>
                          College:
                        </strong>{" "}
                        {selectedCollege}
                      </p>

                      <p>
                        <strong>
                          Date:
                        </strong>{" "}
                        {selectedDate}
                      </p>

                      <p>
                        <strong>
                          Booked Time:
                        </strong>{" "}
                        {formatSelectedTime(
                          selectedTime
                        )}
                      </p>

                      <p>
                        <strong>
                          WhatsApp:
                        </strong>{" "}
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                            `You're all set!
Your counselling appointment has been successfully saved.

College: ${selectedCollege}
Date: ${selectedDate}
Selected Time: ${formatSelectedTime(
                              selectedTime
                            )}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#25D366",
                            textDecoration:
                              "underline",
                            cursor: "pointer",
                          }}
                        >
                          +91 91677 27792
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}