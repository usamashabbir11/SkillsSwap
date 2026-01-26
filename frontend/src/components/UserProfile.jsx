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
        const result = await getUserByIdApi(id);
        setUser(result.data);
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

      {/* Cover */}
      <div className="h-56 bg-gradient-to-r from-gray-400 to-gray-600"></div>

      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="bg-white shadow rounded p-6">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

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

export default UserProfile;
