import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getProfileApi, deleteOwnProfileApi, getReviewsForUserApi } from "../api/userApi";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    await deleteOwnProfileApi();
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        setUser(res.data);
        const reviewsRes = await getReviewsForUserApi(res.data._id);
        setReviews(reviewsRes.data);
      } catch {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  if (!user) return null;

  return (
    <>
      <Navbar />

      {/* COVER */}
      <div
        className="h-80 bg-gray-300"
        style={{
          backgroundImage: user.coverImage
            ? `url(http://localhost:5000${user.coverImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="max-w-5xl mx-auto px-6 -mt-20">
        {/* HEADER */}
        <div className="bg-white shadow rounded p-6 flex items-center gap-6">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : "https://via.placeholder.com/120"
            }
            className="w-28 h-28 rounded-full object-cover border-4 border-white"
          />

          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>

            <button
              onClick={() => navigate("/profile/edit")}
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={handleDeleteAccount}
              className="mt-2 ml-3 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
            >
              Delete My Account
            </button>
          </div>
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

        {/* SKILLS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Skills I Offer</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered?.length
                ? user.skillsOffered.map(skill => (
                    <span key={skill} className="bg-blue-100 px-3 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))
                : "No skills added"}
            </div>
          </div>

          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Skills I Require</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsRequired?.length
                ? user.skillsRequired.map(skill => (
                    <span key={skill} className="bg-red-100 px-3 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))
                : "No skills added"}
            </div>
          </div>
        </div>

        {/* COURSES */}
        <div className="mt-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Courses</h3>

          {user.courses?.length ? (
            <div className="space-y-6">
              {user.courses.map((course, index) => (
                <div key={index}>
                  <h4 className="font-semibold">{course.title}</h4>
                  <p className="text-gray-600 mb-2">Price: ${course.price}</p>

                  <video
                    controls
                    className="w-full rounded"
                    src={`http://localhost:5000${course.video}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No courses added yet.</p>
          )}
        </div>

        {/* PHASE 12 — REVIEWS (read-only) */}
        <div className="mt-10 mb-10 bg-white shadow rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Reviews</h3>

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

export default Profile;
