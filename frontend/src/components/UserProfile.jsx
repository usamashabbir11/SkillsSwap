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
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">{user.name}</h2>

        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Bio:</strong> {user.bio || "Not added"}</p>
        <p><strong>Phone:</strong> {user.phone || "Not added"}</p>
        <p><strong>City:</strong> {user.city || "Not added"}</p>

        {/* READ-ONLY NOTICE */}
        <p className="mt-6 text-sm text-gray-500 italic">
          This is a public profile. You cannot edit it.
        </p>
      </div>
    </>
  );
};

export default UserProfile;
