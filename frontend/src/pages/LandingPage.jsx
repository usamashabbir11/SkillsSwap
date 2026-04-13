import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ─── Static fallback profiles shown when user is not logged in ─── */
const STATIC_PROFILES = [
  { _id: "s1", name: "Ahmad Raza",   skillsOffered: ["React", "Node.js"],         avgRating: 4.9, courses: [1, 2, 3] },
  { _id: "s2", name: "Fatima Khan",  skillsOffered: ["UI Design", "Figma"],        avgRating: 4.7, courses: [1, 2] },
  { _id: "s3", name: "Usman Ali",    skillsOffered: ["Python", "Machine Learning"], avgRating: 4.6, courses: [1, 2, 3, 4] },
];

/* ─── Helpers ─── */
const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColors = ["#1dbf73", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#1abc9c"];
const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

/* ─── Sub-components ─── */

const NavLink = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        color: hov ? "#1dbf73" : "#222222",
        padding: "6px 10px",
        transition: "color 0.15s"
      }}
    >
      {children}
    </button>
  );
};

const GhostBtn = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? "rgba(255,255,255,0.1)" : "transparent",
        color: "#ffffff",
        border: "1.5px solid rgba(255,255,255,0.5)",
        borderRadius: "4px",
        padding: "11px 24px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s"
      }}
    >
      {children}
    </button>
  );
};

const GreenBtn = ({ children, onClick, large }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? "#19a463" : "#1dbf73",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        padding: large ? "14px 32px" : "11px 24px",
        fontSize: large ? "15px" : "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s"
      }}
    >
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${hov ? "#1dbf73" : "#e9e9e9"}`,
        borderRadius: "8px",
        padding: "28px 24px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hov ? "0 4px 16px rgba(29,191,115,0.1)" : "none"
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "14px" }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "#222222" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: "13px", color: "#777777", lineHeight: "1.6" }}>{desc}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/users/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = (res.data || [])
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 3);
        setTopUsers(sorted);
      } catch {
        /* silently fall back to static profiles */
      }
    };
    fetchTopUsers();
  }, []);

  const displayProfiles = topUsers.length > 0 ? topUsers : STATIC_PROFILES;

  return (
    <div style={{ backgroundColor: "#ffffff", fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e9e9e9",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 48px",
        gap: "16px"
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", fontWeight: 800, fontSize: "22px", letterSpacing: "-0.5px", marginRight: "auto" }}
        >
          <span style={{ color: "#222222" }}>Skills</span>
          <span style={{ color: "#1dbf73" }}>Swap</span>
        </div>

        {/* Links */}
        <NavLink onClick={() => {
          document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
        }}>
          How it works
        </NavLink>
        <NavLink onClick={() => navigate("/users")}>Browse</NavLink>

        {/* Auth buttons */}
        <button
          onClick={() => navigate("/login")}
          style={{
            backgroundColor: "transparent",
            color: "#222222",
            border: "1.5px solid #222222",
            borderRadius: "4px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "8px"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#1dbf73"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#222222"}
        >
          Sign In
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{
            backgroundColor: "#1dbf73",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
        >
          Join Free
        </button>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "72px 48px 80px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start"
      }}>
        {/* Left */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(29,191,115,0.15)",
            border: "1px solid rgba(29,191,115,0.3)",
            borderRadius: "20px",
            padding: "6px 14px",
            marginBottom: "24px"
          }}>
            <span style={{ fontSize: "14px" }}>✨</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1dbf73", letterSpacing: "0.3px" }}>
              The skill exchange platform
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            color: "#ffffff",
            fontSize: "42px",
            fontWeight: 800,
            margin: "0 0 20px",
            lineHeight: "1.2",
            letterSpacing: "-0.5px"
          }}>
            Trade skills.<br />
            Grow together.<br />
            <span style={{ color: "#1dbf73" }}>Learn for free.</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "16px",
            lineHeight: "1.7",
            margin: "0 0 36px",
            maxWidth: "440px"
          }}>
            Connect with talented people, swap your expertise, and unlock courses — no money needed. Just skills.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <GreenBtn onClick={() => navigate("/register")} large>
              Get Started Free
            </GreenBtn>
            <GhostBtn onClick={() => navigate("/users")}>
              Browse Skills
            </GhostBtn>
          </div>

          {/* Social proof numbers */}
          <div style={{ display: "flex", gap: "32px", marginTop: "48px" }}>
            {[
              { num: "500+", label: "Active Users" },
              { num: "1.2k+", label: "Skills Swapped" },
              { num: "300+", label: "Courses Shared" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>{num}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — stacked cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Testimonial cards */}
          {[
            {
              name: "Sara M.",
              role: "Computer Science Student",
              text: "I swapped my Python skills for UI design lessons. Learned Figma in 2 weeks — totally free!",
              rating: 5
            },
            {
              name: "Bilal K.",
              role: "Freelance Developer",
              text: "SkillsSwap helped me learn video editing by teaching React. Best deal I've ever made.",
              rating: 5
            }
          ].map((t) => (
            <div
              key={t.name}
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "18px 20px",
                backdropFilter: "blur(8px)"
              }}
            >
              <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: "#ffbe00", fontSize: "14px" }}>★</span>
                ))}
              </div>
              <p style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: "1.6",
                fontStyle: "italic"
              }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: "#1dbf73",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {initials(t.name)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Top rated profiles */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "18px 20px"
          }}>
            <p style={{ margin: "0 0 14px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Top Rated Profiles
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {displayProfiles.map((u) => (
                <div key={u._id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Avatar */}
                  {u.profileImage ? (
                    <img
                      src={`http://localhost:5000${u.profileImage}`}
                      alt={u.name}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: avatarColor(u.name),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0
                    }}>
                      {initials(u.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.name}
                    </p>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "3px" }}>
                      {(u.skillsOffered || []).slice(0, 2).map(s => (
                        <span key={s} style={{
                          backgroundColor: "rgba(29,191,115,0.15)",
                          color: "#1dbf73",
                          borderRadius: "10px",
                          fontSize: "10px",
                          padding: "1px 7px",
                          fontWeight: 500
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Rating + courses */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {u.avgRating > 0 && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#ffbe00", fontWeight: 700 }}>
                        ★ {u.avgRating.toFixed(1)}
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      {u.courses?.length || 0} course{(u.courses?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUSTED BY ══════════ */}
      <section style={{
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #f1f1f1",
        borderBottom: "1px solid #f1f1f1",
        padding: "36px 48px",
        textAlign: "center"
      }}>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#aaaaaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Trusted by students from
        </p>
        <div style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          {["FAST NUCES", "LUMS", "NUST", "UET", "COMSATS"].map((uni) => (
            <span
              key={uni}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#bbbbbb",
                letterSpacing: "0.5px"
              }}
            >
              {uni}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section
        id="how-it-works"
        style={{
          backgroundColor: "#f9f9f9",
          padding: "80px 48px"
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#1dbf73", textTransform: "uppercase", letterSpacing: "1px" }}>
              Simple process
            </p>
            <h2 style={{ margin: "0 0 12px", fontSize: "30px", fontWeight: 800, color: "#222222" }}>
              How it works
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#777777" }}>
              Three easy steps to start swapping skills today
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px"
          }}>
            {[
              {
                step: "1",
                title: "Create your profile",
                desc: "Sign up, add your skills, upload a course video, and tell others what you want to learn in return."
              },
              {
                step: "2",
                title: "Find your match",
                desc: "Browse profiles, use smart filters, and find users whose offered skills match what you need."
              },
              {
                step: "3",
                title: "Exchange and learn",
                desc: "Send a swap request, agree on courses to exchange, and start learning — completely free."
              }
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e9e9e9",
                  borderRadius: "8px",
                  padding: "36px 28px",
                  textAlign: "center"
                }}
              >
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "2px solid #1dbf73",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#1dbf73"
                }}>
                  {step}
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 700, color: "#222222" }}>
                  {title}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#777777", lineHeight: "1.7" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{
        backgroundColor: "#ffffff",
        padding: "80px 48px"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#1dbf73", textTransform: "uppercase", letterSpacing: "1px" }}>
              Everything you need
            </p>
            <h2 style={{ margin: "0 0 12px", fontSize: "30px", fontWeight: 800, color: "#222222" }}>
              Packed with powerful features
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#777777" }}>
              A full platform built to make skill exchange seamless and rewarding
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px"
          }}>
            <FeatureCard
              icon="🎬"
              title="Video Courses"
              desc="Upload and share full video courses with your swap partner. High-quality content, no limits."
            />
            <FeatureCard
              icon="🔄"
              title="Skill Swapping"
              desc="Request a swap with any user. Accept, reject, or negotiate — complete control over every exchange."
            />
            <FeatureCard
              icon="⭐"
              title="Reviews & Ratings"
              desc="Rate courses after completing a swap. Build trust and reputation through honest peer reviews."
            />
            <FeatureCard
              icon="💳"
              title="Course Purchase"
              desc="Not ready to swap? Buy courses directly with Stripe. Secure, instant, and hassle-free."
            />
            <FeatureCard
              icon="🎯"
              title="Smart Matching"
              desc="See your skill match percentage with every user so you can find the best swap partners fast."
            />
            <FeatureCard
              icon="🔔"
              title="Notifications"
              desc="Get real-time alerts for swap requests, acceptances, and course unlocks. Never miss a deal."
            />
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "88px 48px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{
            color: "#ffffff",
            fontSize: "34px",
            fontWeight: 800,
            margin: "0 0 14px",
            letterSpacing: "-0.3px"
          }}>
            Ready to start swapping skills?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "15px",
            margin: "0 0 36px",
            lineHeight: "1.6"
          }}>
            Completely free to get started. No credit card required.
          </p>
          <GreenBtn onClick={() => navigate("/register")} large>
            Create Free Account
          </GreenBtn>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        backgroundColor: "#222222",
        padding: "28px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px" }}>
          <span style={{ color: "#ffffff" }}>Skills</span>
          <span style={{ color: "#1dbf73" }}>Swap</span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#777777" }}>
          © 2026 SkillsSwap. Built for learners, by learners.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
