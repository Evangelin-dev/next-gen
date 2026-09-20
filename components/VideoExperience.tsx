"use client";

import Image from "next/image";
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

const collegeOptions = [
  "Manohar Joshi, Sion",
  "Mumbai Management, Mira Road",
  "Indo Scot, Thane",
  "Goenka, Dombivali",
  "Vivekanand, Kopar Khairane",
  "Indala, Kalyan",
  "Online Campus",
];

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
  const [selectedCollege, setSelectedCollege] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsApplyVisible(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isApplicationOpen) {
      questionRef.current?.focus();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [isApplicationOpen, questionIndex]);

  function openApplication() {
    setIsApplicationOpen(true);
    setQuestionIndex(0);
    setSelectedOption("");
    setIsComplete(false);
    setAnswers({});
    setSelectedCollege("");
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

  function handleCollegeSubmit() {
    if (!selectedCollege) return;

    const message = `Hi, I would like to book an appointment with your counselling centre.

College Name: ${selectedCollege}

Please share the available appointment details.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappUrl;
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    option: string
  ) {
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
    setAnswers({});
    setSelectedCollege("");
    setIsApplyVisible(true);
  }

  const question = questions[questionIndex];

  return (
    <main
      className={`video-page ${
        isApplicationOpen ? "application-mode" : ""
      }`}
    >
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

          <p className="modal-kicker">FOR STUDENTS</p>

          <h1>
            How I Started Building My Career One Skill at a Time
          </h1>

          <p>
            Watch this 1-minute video and discover how finding the right
            skill can help you create a career path that works for you.
          </p>

          <div className="video-frame">
            <video
              className="landing-video"
              controls
              playsInline
              preload="metadata"
              onEnded={openApplication}
            >
              <source
                src="/Next_Gener_Promo.mp4"
                type="video/mp4"
              />

              Your browser does not support the video tag.
            </video>
          </div>

          <p className="assessment-prompt">
            Not sure which skill is right for you?
            <br />
            Take the quick assessment and discover where your strengths
            may fit.
          </p>

          <div
            className={`apply-reveal ${
              isApplyVisible ? "is-visible" : ""
            }`}
          >
            <button
              className="primary-button apply-button"
              onClick={openApplication}
            >
              TAKE THE QUICK ASSESSMENT
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

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
            STUDENT CAREER ASSESSMENT
          </p>

          {!isComplete && (
            <h1 id="application-title">
              Discover Which Skills Suit You Best
            </h1>
          )}

          {!isComplete ? (
            <div
              className={`question-card ${
                isChanging ? "is-changing" : ""
              }`}
              ref={questionRef}
              tabIndex={-1}
            >
              <div className="question-meta">
                <span>{questionIndex + 1}</span>
                <strong>of {questions.length}</strong>
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
                Select one answer to continue. Press Enter after
                choosing.
              </p>

              <div className="answer-list">
                {question.options.map((option, index) => (
                  <button
                    className={`answer-button ${
                      selectedOption === option
                        ? "is-selected"
                        : ""
                    }`}
                    key={option}
                    onClick={() => chooseOption(option)}
                    onKeyDown={(event) =>
                      handleOptionKeyDown(event, option)
                    }
                    disabled={isChanging}
                  >
                    <span className="answer-index">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span>{option}</span>

                    <span
                      className="answer-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="calendly-placeholder">
              <div className="success-mark">✓</div>

              <p className="modal-kicker">
                ASSESSMENT COMPLETE
              </p>

              <h2>Book Your Appointment</h2>

              <p className="question-hint">
                Choose your preferred counselling centre to book
                your appointment.
              </p>

              <label className="college-select-label">
                <span>Choose your college</span>

                <select
                  name="college"
                  value={selectedCollege}
                  onChange={(event) =>
                    setSelectedCollege(event.target.value)
                  }
                >
                  <option value="" disabled>
                    Select college
                  </option>

                  {collegeOptions.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCollege && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleCollegeSubmit}
                >
                  BOOK YOUR APPOINTMENT
                  <span aria-hidden="true">→</span>
                </button>
              )}

            
            </div>
          )}
        </section>
      )}
    </main>
  );
}