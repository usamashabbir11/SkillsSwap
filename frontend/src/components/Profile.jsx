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
      <div className="h-56 bg-gradient-to-r from-blue-500 to-purple-500"></div>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="bg-white shadow rounded p-6">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>

          <button
            onClick={() => navigate("/profile/edit")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p>{user.bio || "No bio added"}</p>
          </div>

          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p><strong>Phone:</strong> {user.phone || "Not added"}</p>
            <p><strong>City:</strong> {user.city || "Not added"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
