import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllUsersApi, adminDeleteUserApi } from "../api/userApi";

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = loggedInUser?.role === "admin";

  const handleAdminDelete = async (userId) => {
    if (!window.confirm("Delete this user and all their data?")) return;
    await adminDeleteUserApi(userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

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

  const filteredUsers = users.filter((user) => {
    const name = nameFilter.trim().toLowerCase();
    const skill = skillFilter.trim().toLowerCase();
    const city = cityFilter.trim().toLowerCase();

    const matchesName = name === "" || user.name.toLowerCase().includes(name);

    const matchesSkill =
      skill === "" ||
      user.skillsOffered?.some((s) => s.toLowerCase().includes(skill)) ||
      user.skillsRequired?.some((s) => s.toLowerCase().includes(skill));

    const matchesCity = city === "" || user.city?.toLowerCase().includes(city);

    return matchesName && matchesSkill && matchesCity;
  });

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto mt-10 px-4">
        {/* SEARCH & FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Search by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Search by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* USER GRID */}
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500">No users match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white p-6 shadow rounded"
              >
                <h3 className="text-lg font-bold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                {user.city && (
                  <p className="text-gray-500 text-sm">{user.city}</p>
                )}

                <button
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="mt-4 bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Visit Profile
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleAdminDelete(user._id)}
                    className="mt-4 ml-3 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete User
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllUsers;
