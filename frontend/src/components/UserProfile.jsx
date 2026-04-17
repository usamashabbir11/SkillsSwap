import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import {
  getUserByIdApi,
  sendSwapRequestApi,
  getSwapDealWithUserApi,
  selectCourseForSwapApi,
  hasPendingSwapRequestApi,
  canAccessCourseApi,
  submitCourseReviewApi,
  getReviewsForUserApi,
  createCheckoutSessionApi,
  getNearbyUsersApi,
  submitComplaintApi
} from "../api/userApi";

const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/120";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const avatarColors = ["#1dbf73", "#1a6fb5", "#e53935", "#f57c00", "#7b1fa2", "#0288d1"];
const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [deal, setDeal] = useState(null);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);
  const [sent, setSent] = useState(false);
  const [purchasedIndexes, setPurchasedIndexes] = useState([]);

  const [accessList, setAccessList] = useState([]);

  const [distanceKm, setDistanceKm] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});
  const [courseComments, setCourseComments] = useState({});
  const [courseReviewSubmitted, setCourseReviewSubmitted] = useState({});
  const [playingIndex, setPlayingIndex] = useState(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Fake Profile");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getUserByIdApi(id);
        const loadedUser = userRes.data;
        setUser(loadedUser);

        try {
          const geoRes = await getNearbyUsersApi();
          const match = (geoRes.data || []).find((u) => String(u._id) === String(id));
          if (match?.distanceKm != null) setDistanceKm(match.distanceKm);
        } catch {
          // geo is optional — silently ignore
        }

        const dealRes = await getSwapDealWithUserApi(id);

        if (dealRes.data) {
          setDeal(dealRes.data);
          setPurchasedIndexes(dealRes.data.purchasedCourseIndexes || []);

          let initialSelectedIndex = null;
          if (dealRes.data.userA === loggedInUser.id && dealRes.data.courseFromB !== null) {
            initialSelectedIndex = dealRes.data.courseFromB;
          } else if (dealRes.data.userB === loggedInUser.id && dealRes.data.courseFromA !== null) {
            initialSelectedIndex = dealRes.data.courseFromA;
          }
          setSelectedCourseIndex(initialSelectedIndex);
        } else {
          setDeal(null);

          const pendingRes = await hasPendingSwapRequestApi(id);
          setSent(pendingRes.data === true);
        }

        if (loadedUser.courses?.length) {
          const accessResults = await Promise.all(
            loadedUser.courses.map((_, index) =>
              canAccessCourseApi(id, index)
                .then((res) => res.data?.canAccess === true)
                .catch(() => false)
            )
          );
          setAccessList(accessResults);
        }

        const reviewsRes = await getReviewsForUserApi(id);
        setReviews(reviewsRes.data);
      } catch {
        navigate("/users");
      }
    };

    load();
  }, [id, navigate, loggedInUser.id]);

  const sendRequest = async () => {
    await sendSwapRequestApi(id);
    setSent(true);
  };

  const selectCourse = async (courseIndex) => {
    await selectCourseForSwapApi(deal.dealId, courseIndex);

    setDeal((prev) => {
      if (!prev) return prev;
      if (prev.userA === loggedInUser.id) return { ...prev, courseFromB: courseIndex };
      if (prev.userB === loggedInUser.id) return { ...prev, courseFromA: courseIndex };
      return prev;
    });

    setSelectedCourseIndex(courseIndex);

    if (user?.courses?.length) {
      const accessResults = await Promise.all(
        user.courses.map((_, index) =>
          canAccessCourseApi(id, index)
            .then((res) => res.data?.canAccess === true)
            .catch(() => false)
        )
      );
      setAccessList(accessResults);
    }
  };

  const handleBuy = async (courseIndex) => {
    try {
      const res = await createCheckoutSessionApi(id, courseIndex);
      window.location.href = res.data.url;
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start checkout");
    }
  };

  const handleSubmitReport = async () => {
    setReportSubmitting(true);
    try {
      await submitComplaintApi(id, reportReason, reportDescription);
      setReportSuccess(true);
      setReportDescription("");
      setReportReason("Fake Profile");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSubmitCourseReview = async (index) => {
    const rating = courseRatings[index] ?? 5;
    const comment = courseComments[index] ?? "";
    await submitCourseReviewApi(id, index, rating, comment);
    const reviewsRes = await getReviewsForUserApi(id);
    setReviews(reviewsRes.data);
    setCourseReviewSubmitted((prev) => ({ ...prev, [index]: true }));
  };

  if (!user) return null;

  const isSender = deal && deal.userA === loggedInUser.id;
  const isReceiver = deal && deal.userB === loggedInUser.id;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const statCards = [
    { icon: "📚", value: user.courses?.length || 0, label: "Courses" },
    { icon: "🔄", value: deal ? 1 : 0, label: "Swaps" },
    { icon: "⭐", value: avgRating || "—", label: "Avg Rating" },
    { icon: "💬", value: reviews.length, label: "Reviews" },
  ];

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Navbar />

      {/* REPORT USER MODAL */}
      {reportModalOpen && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#ffffff", borderRadius: "8px", padding: "28px 28px 24px",
            width: "420px", maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#222222" }}>
              Report User
            </h3>

            {reportSuccess ? (
              <div>
                <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#1dbf73", fontWeight: 600 }}>
                  Report submitted successfully.
                </p>
                <button
                  onClick={() => setReportModalOpen(false)}
                  style={{
                    backgroundColor: "#222222", color: "#ffffff", border: "none",
                    borderRadius: "4px", padding: "9px 20px", fontSize: "13px",
                    fontWeight: 500, cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#555555", marginBottom: "6px" }}>
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: "100%", border: "1px solid #e9e9e9", borderRadius: "4px",
                      padding: "9px 12px", fontSize: "13px", color: "#222222", outline: "none"
                    }}
                  >
                    <option>Fake Profile</option>
                    <option>Inappropriate Content</option>
                    <option>Spam</option>
                    <option>Harassment</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#555555", marginBottom: "6px" }}>
                    Description (optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    style={{
                      width: "100%", border: "1px solid #e9e9e9", borderRadius: "4px",
                      padding: "10px 12px", fontSize: "13px", color: "#222222",
                      outline: "none", resize: "vertical", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setReportModalOpen(false)}
                    style={{
                      backgroundColor: "transparent", color: "#777777",
                      border: "1px solid #dddddd", borderRadius: "4px",
                      padding: "8px 18px", fontSize: "13px", cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={reportSubmitting}
                    style={{
                      backgroundColor: reportSubmitting ? "#cccccc" : "#e53935",
                      color: "#ffffff", border: "none", borderRadius: "4px",
                      padding: "8px 18px", fontSize: "13px", fontWeight: 600,
                      cursor: reportSubmitting ? "not-allowed" : "pointer"
                    }}
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* COVER */}
      <div style={{
        height: "200px",
        backgroundImage: user.coverImage
          ? `url(${getImageUrl(user.coverImage)})`
          : "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} />

      {/* MAIN CONTENT */}
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Glass Profile Card */}
            <div style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              marginTop: "-80px",
              padding: "24px",
              textAlign: "center"
            }}>
              {/* Profile Photo */}
              {user.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user.name}
                  style={{
                    width: "100px", height: "100px", borderRadius: "50%",
                    objectFit: "cover", border: "3px solid #fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                />
              ) : (
                <div style={{
                  width: "100px", height: "100px", borderRadius: "50%",
                  backgroundColor: "#1dbf73", display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "36px", fontWeight: 700, color: "#fff",
                  border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                  {getInitials(user.name)}
                </div>
              )}

              {/* Active Badge */}
              <div style={{ marginTop: "10px" }}>
                <span style={{
                  backgroundColor: "#e8f7f0", color: "#1dbf73",
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", border: "1px solid rgba(29,191,115,0.25)"
                }}>● Active</span>
              </div>

              {/* Name */}
              <h2 style={{ margin: "10px 0 0", fontSize: "20px", fontWeight: 800, color: "#1a1a2e" }}>
                {user.name}
              </h2>

              {/* Bio */}
              {user.bio && (
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                  {user.bio}
                </p>
              )}

              {/* City */}
              {user.city && (
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#555" }}>
                  📍 {user.city}{distanceKm != null ? ` · ${distanceKm} km away` : ""}
                </p>
              )}

              {/* Member Since */}
              {user.createdAt && (
                <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#999" }}>
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}

              {/* Swap Action Button */}
              <div style={{ marginTop: "18px" }}>
                {!deal && (
                  <button
                    disabled={sent}
                    onClick={sendRequest}
                    style={{
                      backgroundColor: sent ? "#cccccc" : "#1dbf73",
                      color: "#ffffff", border: "none", borderRadius: "8px",
                      padding: "10px", fontSize: "14px", fontWeight: 600,
                      cursor: sent ? "not-allowed" : "pointer",
                      transition: "background 0.15s", width: "100%"
                    }}
                    onMouseEnter={e => { if (!sent) e.currentTarget.style.backgroundColor = "#19a463"; }}
                    onMouseLeave={e => { if (!sent) e.currentTarget.style.backgroundColor = "#1dbf73"; }}
                  >
                    {sent ? "Request Sent ⏳" : "Request Skill Swap"}
                  </button>
                )}

                {deal && isSender && (
                  <div style={{
                    backgroundColor: "#e8f7f0", color: "#1dbf73",
                    border: "1.5px solid #1dbf73", borderRadius: "8px",
                    padding: "10px", fontSize: "13px", fontWeight: 600
                  }}>
                    Request accepted — select a course ✔️
                  </div>
                )}

                {deal && isReceiver && (
                  <div style={{
                    backgroundColor: "#e8f7f0", color: "#1dbf73",
                    border: "1.5px solid #1dbf73", borderRadius: "8px",
                    padding: "10px", fontSize: "13px", fontWeight: 600
                  }}>
                    You accepted the request ✔️
                  </div>
                )}
              </div>

              {/* Report User Button */}
              <div style={{ marginTop: "14px" }}>
                <button
                  onClick={() => { setReportModalOpen(true); setReportSuccess(false); }}
                  style={{
                    backgroundColor: "transparent", color: "#aaaaaa",
                    border: "1px solid #dddddd", borderRadius: "6px",
                    padding: "6px 14px", fontSize: "12px", cursor: "pointer", width: "100%"
                  }}
                >
                  Report User
                </button>
              </div>
            </div>

            {/* Contact Info Card */}
            <div style={{
              backgroundColor: "#ffffff", borderRadius: "16px",
              border: "1px solid #e9e9e9", padding: "20px", marginTop: "16px"
            }}>
              <h4 style={{
                margin: "0 0 16px", fontSize: "11px", fontWeight: 700,
                color: "#999", letterSpacing: "1px", textTransform: "uppercase"
              }}>
                Contact Info
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "2px" }}>Email</div>
                  <div style={{ fontSize: "13px", color: "#222", wordBreak: "break-all" }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "2px" }}>Phone</div>
                  <div style={{ fontSize: "13px", color: user.phone ? "#222" : "#bbb" }}>
                    {user.phone || "Not provided"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "2px" }}>City</div>
                  <div style={{ fontSize: "13px", color: user.city ? "#222" : "#bbb" }}>
                    {user.city || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "20px" }}>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  backgroundColor: "#ffffff", borderRadius: "12px",
                  border: "1px solid #e9e9e9", padding: "16px", textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{card.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a2e" }}>{card.value}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>Skills</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a6fb5", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Offers
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsOffered?.length > 0 ? (
                      user.skillsOffered.map((skill) => (
                        <span key={skill} style={{
                          backgroundColor: "#e8f4ff", color: "#1a6fb5",
                          borderRadius: "20px", fontSize: "12px",
                          padding: "4px 12px", fontWeight: 500
                        }}>{skill}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: "13px", color: "#bbb" }}>No skills added</span>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#c0392b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Wants
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsRequired?.length > 0 ? (
                      user.skillsRequired.map((skill) => (
                        <span key={skill} style={{
                          backgroundColor: "#fff0f0", color: "#c0392b",
                          borderRadius: "20px", fontSize: "12px",
                          padding: "4px 12px", fontWeight: 500
                        }}>{skill}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: "13px", color: "#bbb" }}>No skills added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                Courses
                <span style={{
                  backgroundColor: "#f0f2f5", color: "#777", borderRadius: "20px",
                  fontSize: "12px", padding: "2px 10px", fontWeight: 500
                }}>
                  {user.courses?.length || 0}
                </span>
              </h3>

              {user.courses?.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {user.courses.map((course, index) => {
                    const hasAccess = accessList[index] === true;

                    return (
                      <div key={index} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e9e9e9" }}>
                        {/* Single display area: thumbnail+play OR video player OR lock overlay */}
                        <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
                          {hasAccess && playingIndex === index ? (
                            <video
                              controls
                              autoPlay
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                              src={getImageUrl(course.video)}
                            />
                          ) : (
                            <div
                              onClick={() => { if (hasAccess) setPlayingIndex(index); }}
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: hasAccess ? "pointer" : "default" }}
                            >
                              {course.thumbnail ? (
                                <img
                                  src={getImageUrl(course.thumbnail)}
                                  alt={course.title}
                                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                              ) : (
                                <div style={{
                                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                                  background: "linear-gradient(135deg, #1a1a2e, #0f3460)"
                                }} />
                              )}
                              {hasAccess ? (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  backgroundColor: "rgba(0,0,0,0.15)"
                                }}>
                                  <div
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                    style={{
                                      width: "48px", height: "48px", borderRadius: "50%",
                                      backgroundColor: "rgba(255,255,255,0.95)",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                      transition: "transform 0.15s"
                                    }}
                                  >
                                    <span style={{ fontSize: "16px", marginLeft: "3px", color: "#1a1a2e" }}>▶</span>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  backgroundColor: "rgba(0,0,0,0.5)",
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                  <span style={{ fontSize: "28px" }}>🔒</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Course Info & Actions */}
                        <div style={{ padding: "12px 14px" }}>
                          <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>
                            {course.title}
                          </h4>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1dbf73" }}>
                            ${course.price}
                          </span>

                          {/* Select course for swap */}
                          {deal && selectedCourseIndex === null && (
                            purchasedIndexes.includes(index) ? (
                              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#777777" }}>Already purchased</p>
                            ) : (
                              <button
                                onClick={() => selectCourse(index)}
                                style={{
                                  marginTop: "10px",
                                  backgroundColor: "#1dbf73", color: "#ffffff",
                                  border: "none", borderRadius: "6px",
                                  padding: "7px 14px", fontSize: "12px",
                                  fontWeight: 500, cursor: "pointer", display: "block", width: "100%"
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                              >
                                Select for swap
                              </button>
                            )
                          )}

                          {selectedCourseIndex === index && (
                            <p style={{ margin: "10px 0 0", fontSize: "12px", fontWeight: 600, color: "#1dbf73" }}>
                              Course selected ✔️
                            </p>
                          )}

                          {/* Buy button for locked courses */}
                          {!hasAccess && (
                            <button
                              onClick={() => handleBuy(index)}
                              style={{
                                marginTop: "10px",
                                backgroundColor: "#222222", color: "#ffffff",
                                border: "none", borderRadius: "6px",
                                padding: "8px 14px", fontSize: "12px",
                                fontWeight: 500, cursor: "pointer",
                                transition: "background 0.15s", display: "block", width: "100%"
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#222222"}
                            >
                              Buy for ${course.price}
                            </button>
                          )}

                          {/* Per-course review */}
                          {hasAccess && (() => {
                            const existingReview = reviews.find(
                              (r) =>
                                (r.reviewer?._id === loggedInUser.id || r.reviewer === loggedInUser.id) &&
                                r.courseIndex === index
                            );

                            if (existingReview) {
                              return (
                                <div style={{ marginTop: "12px", borderTop: "1px solid #f1f1f1", paddingTop: "12px" }}>
                                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#777777" }}>
                                    Your review
                                  </p>
                                  <div>
                                    {[1,2,3,4,5].map(s => (
                                      <span key={s} style={{ color: s <= existingReview.rating ? "#ffbe00" : "#e9e9e9", fontSize: "16px" }}>★</span>
                                    ))}
                                  </div>
                                  {existingReview.comment && (
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444444" }}>{existingReview.comment}</p>
                                  )}
                                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#1dbf73", fontWeight: 600 }}>Review submitted ✔️</p>
                                </div>
                              );
                            }

                            if (courseReviewSubmitted[index]) {
                              return (
                                <div style={{ marginTop: "12px", borderTop: "1px solid #f1f1f1", paddingTop: "12px" }}>
                                  <p style={{ margin: 0, fontSize: "12px", color: "#1dbf73", fontWeight: 600 }}>Review submitted ✔️</p>
                                </div>
                              );
                            }

                            return (
                              <div style={{ marginTop: "12px", borderTop: "1px solid #f1f1f1", paddingTop: "12px" }}>
                                <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: "#222222" }}>
                                  Review &quot;{course.title}&quot;
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setCourseRatings((prev) => ({ ...prev, [index]: star }))}
                                      style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: "20px", color: star <= (courseRatings[index] ?? 5) ? "#ffbe00" : "#e9e9e9",
                                        padding: "0", lineHeight: 1
                                      }}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={courseComments[index] ?? ""}
                                  onChange={(e) => setCourseComments((prev) => ({ ...prev, [index]: e.target.value }))}
                                  placeholder="Write a comment (optional)..."
                                  rows={3}
                                  style={{
                                    width: "100%", border: "1px solid #e9e9e9",
                                    borderRadius: "4px", padding: "8px 10px",
                                    fontSize: "12px", outline: "none",
                                    resize: "vertical", color: "#222222",
                                    marginBottom: "8px", boxSizing: "border-box"
                                  }}
                                />
                                <button
                                  onClick={() => handleSubmitCourseReview(index)}
                                  style={{
                                    backgroundColor: "#1dbf73", color: "#ffffff",
                                    border: "none", borderRadius: "4px",
                                    padding: "7px 16px", fontSize: "12px",
                                    fontWeight: 500, cursor: "pointer",
                                    transition: "background 0.15s"
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                                >
                                  Submit Review
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "14px", color: "#bbb" }}>No courses available.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                Reviews
                <span style={{
                  backgroundColor: "#f0f2f5", color: "#777", borderRadius: "20px",
                  fontSize: "12px", padding: "2px 10px", fontWeight: 500
                }}>
                  {reviews.length}
                </span>
              </h3>

              {reviews.length === 0 ? (
                <p style={{ margin: 0, fontSize: "14px", color: "#bbb" }}>No reviews yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {reviews.map((review) => (
                    <div key={review._id} style={{ border: "1px solid #f1f1f1", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          backgroundColor: getAvatarColor(review.reviewer?.name),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0
                        }}>
                          {getInitials(review.reviewer?.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", color: "#222" }}>
                            {review.reviewer?.name || "Unknown"}
                          </div>
                          <div>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} style={{ color: s <= review.rating ? "#ffbe00" : "#e9e9e9", fontSize: "14px" }}>★</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", color: "#aaa" }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p style={{ margin: 0, fontSize: "14px", color: "#444", lineHeight: "1.5" }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
