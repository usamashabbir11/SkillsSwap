import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { getProfileApi, deleteOwnProfileApi, getReviewsForUserApi, deleteCourseApi } from "../api/userApi";

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

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("courses");

  // Add course inline form state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState(null);
  const [courseVideo, setCourseVideo] = useState(null);
  const [courseVideoName, setCourseVideoName] = useState("");
  const [courseAdding, setCourseAdding] = useState(false);
  const [courseAdded, setCourseAdded] = useState(false);

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await getProfileApi();
      setUser(res.data);
      const reviewsRes = await getReviewsForUserApi(res.data._id);
      setReviews(reviewsRes.data);
    } catch {
      navigate("/");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    await deleteOwnProfileApi();
    localStorage.clear();
    navigate("/");
  };

  const addCourse = async () => {
    if (!courseTitle || !coursePrice || !courseVideo) {
      alert("Please fill in all course fields and select a video.");
      return;
    }
    try {
      setCourseAdding(true);
      const data = new FormData();
      data.append("title", courseTitle);
      data.append("price", coursePrice);
      data.append("video", courseVideo);
      if (courseThumbnail) data.append("thumbnail", courseThumbnail);
      await axios.post(
        "http://localhost:5000/users/courses",
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setCourseTitle("");
      setCoursePrice("");
      setCourseVideo(null);
      setCourseVideoName("");
      setCourseThumbnail(null);
      setCourseThumbnailPreview(null);
      setCourseAdded(true);
      setCourseAdding(false);
      await fetchProfile();
      setTimeout(() => { setCourseAdded(false); setShowAddCourse(false); }, 2000);
    } catch (err) {
      setCourseAdding(false);
      alert("Failed to add course: " + (err?.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const statCards = [
    { icon: "📚", value: user.courses?.length || 0, label: "Courses", section: "courses" },
    { icon: "🔄", value: 0, label: "Swaps", section: "swaps" },
    { icon: "⭐", value: avgRating || "—", label: "Avg Rating", section: "reviews" },
    { icon: "💬", value: reviews.length, label: "Reviews", section: "reviews" },
  ];

  const inp = {
    width: "100%", border: "1.5px solid #e8eaed", borderRadius: "6px",
    padding: "10px 13px", fontSize: "14px", outline: "none", color: "#222",
    backgroundColor: "#fff", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Navbar />

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
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#555" }}>📍 {user.city}</p>
              )}

              {/* Member Since */}
              {user.createdAt && (
                <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#999" }}>
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => navigate("/profile/edit")}
                  style={{
                    backgroundColor: "#1dbf73", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "10px", fontSize: "14px",
                    fontWeight: 600, cursor: "pointer", width: "100%"
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                >
                  Edit Profile
                </button>

                {JSON.parse(localStorage.getItem("user"))?.role !== "admin" && (
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      backgroundColor: "transparent", color: "#c0392b",
                      border: "1.5px solid #e8b4b8", borderRadius: "8px",
                      padding: "10px", fontSize: "14px", fontWeight: 600,
                      cursor: "pointer", width: "100%"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff0f0"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    Delete Account
                  </button>
                )}
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

            {/* Stats Row — clickable */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {statCards.map((card, i) => {
                const isActive = activeSection === card.section;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveSection(card.section)}
                    style={{
                      backgroundColor: isActive ? "#f0fff8" : "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e9e9e9",
                      borderBottom: isActive ? "3px solid #1dbf73" : "1px solid #e9e9e9",
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>{card.icon}</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a2e" }}>{card.value}</div>
                    <div style={{ fontSize: "12px", color: isActive ? "#1dbf73" : "#999", marginTop: "2px", fontWeight: isActive ? 600 : 400 }}>{card.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Skills Section — always visible */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>Skills</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a6fb5", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Offers
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsOffered?.length
                      ? user.skillsOffered.map(skill => (
                        <span key={skill} style={{
                          backgroundColor: "#e8f4ff", color: "#1a6fb5",
                          borderRadius: "20px", fontSize: "12px",
                          padding: "4px 12px", fontWeight: 500
                        }}>{skill}</span>
                      ))
                      : <span style={{ fontSize: "13px", color: "#bbb" }}>No skills added</span>
                    }
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#c0392b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Wants
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsRequired?.length
                      ? user.skillsRequired.map(skill => (
                        <span key={skill} style={{
                          backgroundColor: "#fff0f0", color: "#c0392b",
                          borderRadius: "20px", fontSize: "12px",
                          padding: "4px 12px", fontWeight: 500
                        }}>{skill}</span>
                      ))
                      : <span style={{ fontSize: "13px", color: "#bbb" }}>No skills added</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* COURSES SECTION */}
            {activeSection === "courses" && (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
                {/* Header with + Add Course button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
                    Courses
                    <span style={{
                      backgroundColor: "#f0f2f5", color: "#777", borderRadius: "20px",
                      fontSize: "12px", padding: "2px 10px", fontWeight: 500
                    }}>
                      {user.courses?.length || 0}
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowAddCourse(v => !v)}
                    style={{
                      backgroundColor: showAddCourse ? "#f0f2f5" : "#1dbf73",
                      color: showAddCourse ? "#555" : "#fff",
                      border: "none", borderRadius: "8px",
                      padding: "7px 16px", fontSize: "13px", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    {showAddCourse ? "✕ Cancel" : "+ Add Course"}
                  </button>
                </div>

                {/* Inline Add Course Form */}
                {showAddCourse && (
                  <div style={{
                    border: "1.5px dashed #1dbf73", borderRadius: "12px",
                    padding: "20px", marginBottom: "20px", backgroundColor: "#f9fffe"
                  }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>New Course</h4>

                    {/* Title + Price */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#666", marginBottom: "5px", textTransform: "uppercase" }}>Course Title</label>
                        <input
                          value={courseTitle}
                          onChange={e => setCourseTitle(e.target.value)}
                          placeholder="e.g. Introduction to React"
                          style={inp}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#666", marginBottom: "5px", textTransform: "uppercase" }}>Price (USD)</label>
                        <input
                          value={coursePrice}
                          onChange={e => setCoursePrice(e.target.value)}
                          placeholder="e.g. 49"
                          type="number"
                          style={inp}
                        />
                      </div>
                    </div>

                    {/* Thumbnail upload */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#666", marginBottom: "5px", textTransform: "uppercase" }}>Thumbnail</label>
                      <div
                        onClick={() => thumbnailInputRef.current?.click()}
                        style={{
                          border: "2px dashed #e8eaed", borderRadius: "8px",
                          padding: "20px", textAlign: "center", cursor: "pointer",
                          backgroundColor: courseThumbnailPreview ? "transparent" : "#fafafa",
                          backgroundImage: courseThumbnailPreview ? `url(${courseThumbnailPreview})` : "none",
                          backgroundSize: "cover", backgroundPosition: "center",
                          position: "relative", minHeight: "80px",
                          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
                        }}
                      >
                        {courseThumbnailPreview && <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: "6px" }} />}
                        <span style={{ position: "relative", zIndex: 1, fontSize: "20px" }}>🖼️</span>
                        <span style={{ position: "relative", zIndex: 1, fontSize: "12px", color: courseThumbnailPreview ? "#fff" : "#888", marginTop: "4px", fontWeight: 500 }}>
                          {courseThumbnailPreview ? "Thumbnail selected ✅ — click to change" : "+ Add Thumbnail"}
                        </span>
                      </div>
                      <input ref={thumbnailInputRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setCourseThumbnail(file);
                          setCourseThumbnailPreview(URL.createObjectURL(file));
                        }}
                      />
                      <p style={{ fontSize: "11px", color: "#999", marginTop: "5px", textAlign: "center" }}>
                        📐 16:9 ratio (1280×720px) recommended
                      </p>
                    </div>

                    {/* Video upload */}
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#666", marginBottom: "5px", textTransform: "uppercase" }}>Course Video</label>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        style={{
                          border: `2px dashed ${courseVideoName ? "#1dbf73" : "#e8eaed"}`,
                          borderRadius: "8px", padding: "20px", textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: courseVideoName ? "#f0fff8" : "#fafafa",
                          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{courseVideoName ? "🎬" : "📹"}</span>
                        <span style={{ fontSize: "12px", color: courseVideoName ? "#1dbf73" : "#888", marginTop: "4px", fontWeight: 500 }}>
                          {courseVideoName ? `${courseVideoName} ✅` : "Click to upload video"}
                        </span>
                        {!courseVideoName && <span style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>MP4, MOV, AVI supported</span>}
                      </div>
                      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setCourseVideo(file);
                          setCourseVideoName(file.name);
                        }}
                      />
                    </div>

                    {/* Success message */}
                    {courseAdded && (
                      <div style={{
                        backgroundColor: "#f0fff8", border: "1px solid #1dbf73",
                        borderRadius: "6px", padding: "10px 16px", marginBottom: "12px",
                        fontSize: "13px", color: "#1dbf73", fontWeight: 500
                      }}>
                        Course added successfully ✅
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={addCourse}
                        disabled={courseAdding}
                        style={{
                          flex: 1, backgroundColor: courseAdding ? "#aaa" : "#1dbf73",
                          color: "#fff", border: "none", borderRadius: "8px",
                          padding: "10px", fontSize: "14px", fontWeight: 600,
                          cursor: courseAdding ? "not-allowed" : "pointer", transition: "background 0.15s"
                        }}
                      >
                        {courseAdding ? "Uploading…" : "Upload Course"}
                      </button>
                      <button
                        onClick={() => { setShowAddCourse(false); setCourseTitle(""); setCoursePrice(""); setCourseVideo(null); setCourseVideoName(""); setCourseThumbnail(null); setCourseThumbnailPreview(null); }}
                        style={{
                          backgroundColor: "#fff", color: "#555",
                          border: "1.5px solid #e8eaed", borderRadius: "8px",
                          padding: "10px 20px", fontSize: "14px", cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Courses Grid */}
                {user.courses?.length ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {user.courses.map((course, index) => (
                      <div key={index} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e9e9e9", position: "relative" }}>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
                            try {
                              const res = await deleteCourseApi(index);
                              if (res.success) {
                                setUser(prev => ({ ...prev, courses: res.data }));
                                if (playingIndex === index) setPlayingIndex(null);
                              }
                            } catch (err) {
                              alert("Failed to delete course.");
                            }
                          }}
                          style={{
                            position: "absolute", top: "8px", right: "8px", zIndex: 10,
                            backgroundColor: "rgba(220,38,38,0.9)", color: "#fff",
                            border: "none", borderRadius: "6px",
                            width: "28px", height: "28px", fontSize: "14px",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            lineHeight: 1
                          }}
                          title="Delete course"
                        >
                          🗑
                        </button>
                        <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
                          {playingIndex === index ? (
                            <video
                              controls
                              autoPlay
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                              src={getImageUrl(course.video)}
                            />
                          ) : (
                            <div
                              onClick={() => setPlayingIndex(index)}
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer" }}
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
                            </div>
                          )}
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>
                            {course.title}
                          </h4>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1dbf73" }}>
                            ${course.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "14px", color: "#bbb" }}>No courses added yet.</p>
                )}
              </div>
            )}

            {/* SWAPS SECTION */}
            {activeSection === "swaps" && (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e9e9e9", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>Swaps</h3>
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                  color: "#bbb", fontSize: "14px"
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔄</div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Swap history coming soon</p>
                  <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Your completed skill swaps will appear here.</p>
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            {activeSection === "reviews" && (
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
