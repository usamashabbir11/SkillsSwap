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
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-2">{user.name}</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </>
  );
};

export default UserProfile;
