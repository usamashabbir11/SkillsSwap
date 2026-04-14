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
  getNearbyUsersApi
} from "../api/userApi";

const sectionStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e9e9e9",
  borderRadius: "8px",
  padding: "24px"
};

const sectionTitleStyle = {
  fontSize: "17px",
  fontWeight: 700,
  color: "#222222",
  margin: "0 0 20px"
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

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      {/* COVER */}
      <div style={{
        height: "220px",
        backgroundColor: "#e9e9e9",
        backgroundImage: user.coverImage
          ? `url(http://localhost:5000${user.coverImage})`
          : "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        {/* PROFILE HEADER */}
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

          <div style={{ flex: 1, minWidth: "180px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#222222" }}>
                {user.name}
              </h1>
              {avgRating && (
                <span style={{ fontSize: "13px", color: "#777777" }}>
                  <span style={{ color: "#ffbe00", fontSize: "15px" }}>★</span> {avgRating} ({reviews.length})
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", color: "#777777", fontSize: "14px" }}>{user.email}</p>
            {user.city && (
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#777777" }}>
                📍 {user.city}{distanceKm != null ? ` · ${distanceKm} km away` : ""}
              </p>
            )}
          </div>

          {/* SWAP ACTION BUTTON */}
          <div>
            {!deal && (
              <button
                disabled={sent}
                onClick={sendRequest}
                style={{
                  backgroundColor: sent ? "#cccccc" : "#1dbf73",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: sent ? "not-allowed" : "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={e => { if (!sent) e.currentTarget.style.backgroundColor = "#19a463"; }}
                onMouseLeave={e => { if (!sent) e.currentTarget.style.backgroundColor = "#1dbf73"; }}
              >
                {sent ? "Request Sent ⏳" : "Request Skill Swap"}
              </button>
            )}

            {deal && isSender && (
              <div style={{
                backgroundColor: "#e8f7f0",
                color: "#1dbf73",
                border: "1.5px solid #1dbf73",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 600
              }}>
                Request accepted — select a course ✔️
              </div>
            )}

            {deal && isReceiver && (
              <div style={{
                backgroundColor: "#e8f7f0",
                color: "#1dbf73",
                border: "1.5px solid #1dbf73",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 600
              }}>
                You accepted the request ✔️
              </div>
            )}
          </div>
        </div>

        {/* ABOUT + CONTACT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, fontSize: "15px", marginBottom: "12px" }}>About</h3>
            <p style={{ margin: 0, color: user.bio ? "#444444" : "#aaaaaa", fontSize: "14px", lineHeight: "1.6" }}>
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, fontSize: "15px", marginBottom: "12px" }}>Contact</h3>
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
            <h3 style={{ ...sectionTitleStyle, fontSize: "15px", marginBottom: "12px" }}>Skills I Offer</h3>
            {user.skillsOffered?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {user.skillsOffered.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      backgroundColor: "#e8f4ff",
                      color: "#1a6fb5",
                      borderRadius: "20px",
                      fontSize: "13px",
                      padding: "5px 12px",
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No skills added</p>
            )}
          </div>

          <div style={sectionStyle}>
            <h3 style={{ ...sectionTitleStyle, fontSize: "15px", marginBottom: "12px" }}>Skills I Require</h3>
            {user.skillsRequired?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {user.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      backgroundColor: "#fff0f0",
                      color: "#c0392b",
                      borderRadius: "20px",
                      fontSize: "13px",
                      padding: "5px 12px",
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No skills added</p>
            )}
          </div>
        </div>

        {/* COURSES */}
        <div style={{ ...sectionStyle, marginTop: "20px" }}>
          <h3 style={sectionTitleStyle}>Courses</h3>

          {user.courses?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {user.courses.map((course, index) => {
                const hasAccess = accessList[index] === true;

                return (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #f1f1f1",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}
                  >
                    {/* Course Header */}
                    <div style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #f1f1f1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
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

                    {/* Course Actions & Video */}
                    <div style={{ padding: "16px 20px" }}>
                      {deal && selectedCourseIndex === null && (
                        purchasedIndexes.includes(index) ? (
                          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#777777" }}>Already purchased</p>
                        ) : (
                          <button
                            onClick={() => selectCourse(index)}
                            style={{
                              marginBottom: "14px",
                              backgroundColor: "#1dbf73",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "8px 18px",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "block"
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                          >
                            Select this course for swap
                          </button>
                        )
                      )}

                      {selectedCourseIndex === index && (
                        <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#1dbf73" }}>
                          Course selected ✔️
                        </p>
                      )}

                      {/* Video / Locked State */}
                      {hasAccess ? (
                        <video
                          controls
                          style={{ width: "100%", borderRadius: "6px", maxHeight: "300px" }}
                          src={`http://localhost:5000${course.video}`}
                        />
                      ) : (
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f9f9f9",
                          border: "1px solid #f1f1f1",
                          borderRadius: "8px",
                          padding: "40px 20px",
                          gap: "12px"
                        }}>
                          <span style={{ fontSize: "40px" }}>🔒</span>
                          <p style={{ margin: 0, color: "#777777", fontSize: "14px", fontWeight: 500 }}>
                            Swap or Buy to Unlock
                          </p>
                          <button
                            onClick={() => handleBuy(index)}
                            style={{
                              backgroundColor: "#222222",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "10px 24px",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#222222"}
                          >
                            Buy for ${course.price}
                          </button>
                        </div>
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
                            <div style={{ marginTop: "16px", borderTop: "1px solid #f1f1f1", paddingTop: "16px" }}>
                              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#777777" }}>
                                Your review for &quot;{course.title}&quot;
                              </p>
                              <div>
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} style={{ color: s <= existingReview.rating ? "#ffbe00" : "#e9e9e9", fontSize: "18px" }}>★</span>
                                ))}
                              </div>
                              {existingReview.comment && (
                                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#444444" }}>{existingReview.comment}</p>
                              )}
                              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#1dbf73", fontWeight: 600 }}>Review submitted ✔️</p>
                            </div>
                          );
                        }

                        if (courseReviewSubmitted[index]) {
                          return (
                            <div style={{ marginTop: "16px", borderTop: "1px solid #f1f1f1", paddingTop: "16px" }}>
                              <p style={{ margin: 0, fontSize: "13px", color: "#1dbf73", fontWeight: 600 }}>Review submitted ✔️</p>
                            </div>
                          );
                        }

                        return (
                          <div style={{ marginTop: "16px", borderTop: "1px solid #f1f1f1", paddingTop: "16px" }}>
                            <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600, color: "#222222" }}>
                              Review &quot;{course.title}&quot;
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                              <span style={{ fontSize: "13px", color: "#777777" }}>Rating:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setCourseRatings((prev) => ({ ...prev, [index]: star }))}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    color: star <= (courseRatings[index] ?? 5) ? "#ffbe00" : "#e9e9e9",
                                    padding: "0",
                                    lineHeight: 1
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
                                width: "100%",
                                border: "1px solid #e9e9e9",
                                borderRadius: "4px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                outline: "none",
                                resize: "vertical",
                                color: "#222222",
                                marginBottom: "10px"
                              }}
                            />
                            <button
                              onClick={() => handleSubmitCourseReview(index)}
                              style={{
                                backgroundColor: "#1dbf73",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "9px 20px",
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
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
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No courses available.</p>
          )}
        </div>

        {/* REVIEWS */}
        <div style={{ ...sectionStyle, marginTop: "20px", marginBottom: "40px" }}>
          <h3 style={sectionTitleStyle}>
            Reviews {reviews.length > 0 && <span style={{ color: "#777777", fontWeight: 400, fontSize: "14px" }}>({reviews.length})</span>}
          </h3>

          {reviews.length === 0 ? (
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px" }}>No reviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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

export default UserProfile;
