import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { getUserByIdApi, sendSwapRequestApi } from "../api/userApi";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserByIdApi(id);
        setUser(res.data);
      } catch {
        navigate("/users");
      }
    };
    fetchUser();
  }, [id, navigate]);

  const sendRequest = async () => {
    try {
      await sendSwapRequestApi(id);
      setSent(true);
    } catch {
      // optional: silently fail or show toast later
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      {/* COVER */}
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

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* SWAP BUTTON */}
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
            <h3 className="font-semibold mb-2">Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered?.length
                ? user.skillsOffered.map(skill => (
                    <span
                      key={skill}
                      className="bg-blue-100 px-3 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))
                : "No skills listed"}
            </div>
          </div>

          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsRequired?.length
                ? user.skillsRequired.map(skill => (
                    <span
                      key={skill}
                      className="bg-red-100 px-3 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))
                : "No skills listed"}
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
                  <p className="text-gray-600 mb-2">
                    Price: ${course.price}
                  </p>

                  <video
                    controls
                    className="w-full rounded"
                    src={`http://localhost:5000${course.video}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No courses available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
