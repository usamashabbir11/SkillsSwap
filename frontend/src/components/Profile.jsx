import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getProfileApi, deleteOwnProfileApi, getReviewsForUserApi } from "../api/userApi";

const sectionStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e9e9e9",
  borderRadius: "8px",
  padding: "24px"
};

const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#222222",
  margin: "0 0 14px"
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    await deleteOwnProfileApi();
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
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
    fetchProfile();
  }, [navigate]);

  if (!user) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      {/* COVER */}
      <div
        style={{
          height: "220px",
          backgroundColor: "#e9e9e9",
          backgroundImage: user.coverImage
            ? `url(http://localhost:5000${user.coverImage})`
            : "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        {/* PROFILE HEADER CARD */}
        <div style={{
          ...sectionStyle,
          marginTop: "-60px",
          display: "flex",
          alignItems: "flex-end",
          gap: "20px",
          flexWrap: "wrap"
        }}>
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1dbf73&color=fff&size=112`
            }
            alt={user.name}
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              flexShrink: 0
            }}
          />

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#222222" }}>
                {user.name}
              </h1>
              {avgRating && (
                <span style={{ fontSize: "13px", color: "#777777" }}>
                  <span style={{ color: "#ffbe00", fontSize: "15px" }}>★</span> {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", color: "#777777", fontSize: "14px" }}>{user.email}</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/profile/edit")}
              style={{
                backgroundColor: "#1dbf73",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "9px 20px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
            >
              Edit Profile
            </button>

            <button
              onClick={handleDeleteAccount}
              style={{
                backgroundColor: "#fff0f0",
                color: "#c0392b",
                border: "1.5px solid #e8b4b8",
                borderRadius: "4px",
                padding: "9px 20px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fde0e0"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff0f0"}
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* ABOUT + CONTACT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>About</h3>
            <p style={{ margin: 0, color: user.bio ? "#444444" : "#aaaaaa", fontSize: "14px", lineHeight: "1.6" }}>
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Contact</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "#444444" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#777777", minWidth: "50px" }}>Phone</span>
                <span>{user.phone || <span style={{ color: "#aaaaaa" }}>Not provided</span>}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#777777", minWidth: "50px" }}>City</span>
                <span>{user.city || <span style={{ color: "#aaaaaa" }}>Not provided</span>}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Skills I Offer</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {user.skillsOffered?.length
                ? user.skillsOffered.map(skill => (
                  <span
                    key={skill}
                    style={{
                      backgroundColor: "#e8f4ff",
                      color: "#1a6fb5",
                      borderRadius: "20px",
                      fontSize: "12px",
                      padding: "4px 12px",
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))
                : <span style={{ color: "#aaaaaa", fontSize: "14px" }}>No skills added</span>
              }
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Skills I Require</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {user.skillsRequired?.length
                ? user.skillsRequired.map(skill => (
                  <span
                    key={skill}
                    style={{
                      backgroundColor: "#fff0f0",
                      color: "#c0392b",
                      borderRadius: "20px",
                      fontSize: "12px",
                      padding: "4px 12px",
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))
                : <span style={{ color: "#aaaaaa", fontSize: "14px" }}>No skills added</span>
              }
            </div>
          </div>
        </div>

        {/* COURSES */}
        <div style={{ ...sectionStyle, marginTop: "20px" }}>
          <h3 style={{ ...sectionTitleStyle, fontSize: "17px", marginBottom: "20px" }}>My Courses</h3>

          {user.courses?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {user.courses.map((course, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #f1f1f1",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f1f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#222222" }}>
                      {course.title}
                    </h4>
                    <span style={{
                      backgroundColor: "#e8f7f0",
                      color: "#1dbf73",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: 700
                    }}>
                      ${course.price}
                    </span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <video
                      controls
                      style={{ width: "100%", borderRadius: "4px", maxHeight: "300px" }}
                      src={`http://localhost:5000${course.video}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No courses added yet.</p>
          )}
        </div>

        {/* REVIEWS */}
        <div style={{ ...sectionStyle, marginTop: "20px", marginBottom: "40px" }}>
          <h3 style={{ ...sectionTitleStyle, fontSize: "17px", marginBottom: "20px" }}>
            Reviews {reviews.length > 0 && <span style={{ color: "#777777", fontWeight: 400, fontSize: "14px" }}>({reviews.length})</span>}
          </h3>

          {reviews.length === 0 ? (
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No reviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.map((review) => (
                <div
                  key={review._id}
                  style={{
                    border: "1px solid #f1f1f1",
                    borderRadius: "8px",
                    padding: "16px 20px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#222222" }}>
                      {review.reviewer?.name || "Unknown"}
                    </span>
                    <div>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= review.rating ? "#ffbe00" : "#e9e9e9", fontSize: "16px" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#444444", lineHeight: "1.5" }}>
                      {review.comment}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: "12px", color: "#aaaaaa" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
