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
  submitReviewApi,
  submitPurchaseReviewApi,
  getReviewsForUserApi,
  getMyPurchasesApi,
  createCheckoutSessionApi
} from "../api/userApi";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [deal, setDeal] = useState(null);
  const [courseSelected, setCourseSelected] = useState(false);
  const [sent, setSent] = useState(false);

  // Phase 8: array of booleans, one per course index
  const [accessList, setAccessList] = useState([]);

  // Phase 12: reviews
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hasPurchaseFromVisited, setHasPurchaseFromVisited] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getUserByIdApi(id);
        const loadedUser = userRes.data;
        setUser(loadedUser);

        const dealRes = await getSwapDealWithUserApi(id);

        if (dealRes.data) {
          setDeal(dealRes.data);

          const isA =
            dealRes.data.userA === loggedInUser.id &&
            dealRes.data.courseFromB !== null;

          const isB =
            dealRes.data.userB === loggedInUser.id &&
            dealRes.data.courseFromA !== null;

          setCourseSelected(Boolean(isA || isB));
        } else {
          setDeal(null);

          const pendingRes = await hasPendingSwapRequestApi(id);
          setSent(pendingRes.data === true);
        }

        // Phase 8: check access for each course of the visited user
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

        // Phase 12: load reviews for the visited user
        const reviewsRes = await getReviewsForUserApi(id);
        setReviews(reviewsRes.data);

        // Check if logged-in user has purchased any course from the visited user
        const purchasesRes = await getMyPurchasesApi();
        const purchased = purchasesRes.data.some((p) => p.owner === id || p.owner?._id === id || p.owner?.toString() === id);
        setHasPurchaseFromVisited(purchased);
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

      if (prev.userA === loggedInUser.id) {
        return { ...prev, courseFromB: courseIndex };
      }

      if (prev.userB === loggedInUser.id) {
        return { ...prev, courseFromA: courseIndex };
      }

      return prev;
    });

    setCourseSelected(true);

    // Phase 8: re-check access after course selection
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

  const handleSubmitReview = async () => {
    if (dealComplete) {
      await submitReviewApi(deal.dealId, reviewRating, reviewComment);
    } else {
      await submitPurchaseReviewApi(id, reviewRating, reviewComment);
    }
    const reviewsRes = await getReviewsForUserApi(id);
    setReviews(reviewsRes.data);
    setReviewSubmitted(true);
  };

  if (!user) return null;

  const isSender = deal && deal.userA === loggedInUser.id;
  const isReceiver = deal && deal.userB === loggedInUser.id;

  const dealComplete = deal && deal.courseFromA !== null && deal.courseFromB !== null;
  const alreadyReviewed = reviews.some(
    (r) => r.reviewer?._id === loggedInUser.id || r.reviewer === loggedInUser.id
  );

  return (
    <>
      <Navbar />

      <div
        className="h-80 bg-gray-400"
        style={{
          backgroundImage: user.coverImage
            ? `url(http://localhost:5000${user.coverImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="max-w-5xl mx-auto px-6 -mt-20">
        <div className="bg-white shadow rounded p-6 flex items-center gap-6">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : "https://via.placeholder.com/120"
            }
            className="w-28 h-28 rounded-full object-cover border-4 border-white"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {!deal && (
            <button
              disabled={sent}
              onClick={sendRequest}
              className={`px-4 py-2 rounded text-white ${
                sent
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sent ? "Request Sent ⏳" : "Request Skill Swap"}
            </button>
          )}

          {deal && isSender && (
            <button
              disabled
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Request accepted — you can select a course ✔️
            </button>
          )}

          {deal && isReceiver && (
            <button
              disabled
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              You accepted the request ✔️
            </button>
          )}
        </div>

        {/* ABOUT + CONTACT */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p>{user.bio || "No bio added yet."}</p>
          </div>

          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
            <p><strong>City:</strong> {user.city || "Not provided"}</p>
          </div>
        </div>

        <div className="mt-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Courses</h3>

          {user.courses?.length ? (
            <div className="space-y-6">
              {user.courses.map((course, index) => {
                const hasAccess = accessList[index] === true;

                return (
                  <div key={index} className="border rounded p-4">
                    <h4 className="font-semibold text-lg">{course.title}</h4>

                    <p className="text-gray-600 mb-3">
                      Price: ${course.price}
                    </p>

                    {deal && !courseSelected && (
                      <button
                        onClick={() => selectCourse(index)}
                        className="mb-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Select this course for swap
                      </button>
                    )}

                    {courseSelected && (
                      <p className="text-green-600 font-semibold mb-3">
                        Course selected ✔️
                      </p>
                    )}

                    {/* Phase 8 + 10: Locked vs Unlocked video */}
                    {hasAccess ? (
                      <video
                        controls
                        className="w-full rounded"
                        src={`http://localhost:5000${course.video}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 rounded w-full py-10 gap-3">
                        <span className="text-5xl">🔒</span>
                        <p className="text-gray-600 font-medium text-sm">
                          Swap or Buy to Unlock
                        </p>
                        <button
                          onClick={() => handleBuy(index)}
                          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 text-sm font-medium"
                        >
                          Buy for ${course.price}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No courses available.</p>
          )}
        </div>

        {/* PHASE 12 — REVIEWS */}
        <div className="mt-10 mb-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Reviews</h3>

          {/* REVIEW FORM — when deal complete OR purchased, and not yet reviewed */}
          {(dealComplete || hasPurchaseFromVisited) && !alreadyReviewed && !reviewSubmitted && (
            <div className="mb-6 border rounded p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Leave a Review</h4>

              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium">Rating:</label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl ${star <= reviewRating ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write a comment (optional)..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                rows={3}
              />

              <button
                onClick={handleSubmitReview}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          )}

          {(alreadyReviewed || reviewSubmitted) && (dealComplete || hasPurchaseFromVisited) && (
            <p className="text-green-600 font-medium mb-4">You have reviewed this user ✔️</p>
          )}

          {/* REVIEWS LIST */}
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{review.reviewer?.name || "Unknown"}</span>
                    <span className="text-yellow-400 text-lg">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default UserProfile;
