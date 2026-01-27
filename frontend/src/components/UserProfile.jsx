import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { getUserByIdApi } from "../api/userApi";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
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
            <h3 className="font-semibold mb-2">Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered?.length
                ? user.skillsOffered.map(skill => (
                    <span key={skill} className="bg-blue-100 px-3 py-1 rounded text-sm">
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
                    <span key={skill} className="bg-red-100 px-3 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))
                : "No skills listed"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
