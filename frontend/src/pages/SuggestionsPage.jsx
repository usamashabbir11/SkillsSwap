import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getSuggestionsApi } from "../api/userApi";

const matchColor = (pct) => {
  if (pct >= 70) return "#1dbf73";
  if (pct >= 40) return "#f39c12";
  return "#e74c3c";
};

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSuggestionsApi();
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        padding: "48px 24px 40px",
        textAlign: "center"
      }}>
        <h1 style={{
          color: "#ffffff",
          fontSize: "36px",
          fontWeight: 800,
          margin: "0 0 10px",
          letterSpacing: "-0.5px"
        }}>
          AI Suggested <span style={{ color: "#1dbf73" }}>for You</span>
        </h1>
        <p style={{
          color: "#aaaaaa",
          fontSize: "15px",
          margin: 0
        }}>
          Powered by skill matching + location + ratings
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 24px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>✨</p>
            <p style={{ color: "#777777", fontSize: "15px" }}>Finding your best matches...</p>
          </div>
        ) : (() => {
          const visible = suggestions.filter((u) => u.combinedScore > 0);
          if (visible.length === 0) {
            return (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🤖</p>
                <p style={{ color: "#777777", fontSize: "14px", margin: 0 }}>
                  Add your skills and location to your profile to get personalized AI suggestions
                </p>
              </div>
            );
          }
          return (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px"
              }}>
                {visible.map((user) => (
              <div
                key={user._id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e9e9e9",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* CARD HEADER */}
                <div style={{
                  background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
                  height: "64px"
                }} />

                {/* AVATAR */}
                <div style={{ padding: "0 16px", marginTop: "-28px" }}>
                  <img
                    src={
                      user.profileImage
                        ? `http://localhost:5000${user.profileImage}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1dbf73&color=fff&size=56`
                    }
                    alt={user.name}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      border: "3px solid #ffffff",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>

                {/* CARD BODY */}
                <div style={{ padding: "10px 16px 18px" }}>
                  {/* Name */}
                  <h3 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 700, color: "#222222" }}>
                    {user.name}
                  </h3>

                  {/* City + Distance */}
                  {(user.city || user.distanceKm != null) && (
                    <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#777777" }}>
                      {user.city && user.distanceKm != null
                        ? `📍 ${user.city} · ${user.distanceKm} km away`
                        : user.city
                        ? `📍 ${user.city}`
                        : `📍 ${user.distanceKm} km away`}
                    </p>
                  )}

                  {/* Star Rating */}
                  {user.avgRating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                      <span style={{ color: "#ffbe00", fontSize: "13px" }}>★</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#222222" }}>
                        {user.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Skills Offered Tags */}
                  {user.skillsOffered?.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "11px", color: "#999999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Offers</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {user.skillsOffered.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              backgroundColor: "#e8f4ff",
                              color: "#1a6fb5",
                              borderRadius: "20px",
                              fontSize: "11px",
                              padding: "3px 9px",
                              fontWeight: 500
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <span style={{ fontSize: "11px", color: "#777777", padding: "3px 2px" }}>
                            +{user.skillsOffered.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Required Tags */}
                  {user.skillsRequired?.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <p style={{ fontSize: "11px", color: "#999999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Wants</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {user.skillsRequired.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              backgroundColor: "#fff0f0",
                              color: "#c0392b",
                              borderRadius: "20px",
                              fontSize: "11px",
                              padding: "3px 9px",
                              fontWeight: 500
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Score Bar */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#777777" }}>Match Score</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: matchColor(user.combinedScore) }}>
                        {user.combinedScore}%
                      </span>
                    </div>
                    <div style={{ height: "4px", backgroundColor: "#f1f1f1", borderRadius: "2px" }}>
                      <div style={{
                        height: "4px",
                        width: `${user.combinedScore}%`,
                        backgroundColor: matchColor(user.combinedScore),
                        borderRadius: "2px",
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  </div>

                  {/* Visit Profile Button */}
                  <button
                    onClick={() => navigate(`/users/${user._id}`)}
                    style={{
                      width: "100%",
                      backgroundColor: "#1dbf73",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "9px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                  >
                    Visit Profile
                  </button>
                </div>
              </div>
                ))}
              </div>
              {visible.length < 3 && (
                <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#777777" }}>
                  Add more skills to your profile to get better AI suggestions
                </p>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default SuggestionsPage;
