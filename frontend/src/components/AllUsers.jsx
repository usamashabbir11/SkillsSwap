import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllUsersApi } from "../api/userApi";

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsersApi();
        setUsers(result.data);
      } catch {
        navigate("/login");
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-6 shadow rounded"
          >
            <h3 className="text-lg font-bold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>

            <button
              onClick={() => navigate(`/users/${user._id}`)}
              className="mt-4 bg-blue-600 text-white px-4 py-1 rounded"
            >
              Visit Profile
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllUsers;
