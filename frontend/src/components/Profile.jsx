import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getProfileApi } from "../api/userApi";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfileApi();
        setUser(result.data);
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

      {/* Cover */}
      <div
        className="h-100 bg-gray-400"
        style={{
          backgroundImage: user.coverImage
            ? `url(http://localhost:5000${user.coverImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="max-w-5xl mx-auto px-6 -mt-16">
        {/* Header */}
        <div className="bg-gray-300 shadow rounded p-6 flex items-center gap-6">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : "https://via.placeholder.com/100"
            }
            className="w-24 h-24 rounded-full object-cover bg-gray-600"
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
          </div>
        </div>

        {/* INFO SECTIONS */}
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
      </div>
    </>
  );
};

export default Profile;
