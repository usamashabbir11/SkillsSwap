import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAdminStatsApi } from "../api/userApi";

const StatCard = ({ label, value }) => (
  <div className="bg-white shadow rounded p-6 text-center">
    <p className="text-4xl font-bold text-blue-600 mb-2">{value}</p>
    <p className="text-gray-600 font-medium">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/users");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await getAdminStatsApi();
        setStats(res.data);
      } catch {
        navigate("/users");
      }
    };

    fetchStats();
  }, [navigate]);

  if (!stats) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 px-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Swap Requests Sent" value={stats.totalSwapRequests} />
          <StatCard label="Completed Swaps" value={stats.totalCompletedSwaps} />
          <StatCard label="Courses Uploaded" value={stats.totalCourses} />
          <StatCard label="Reviews Given" value={stats.totalReviews} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
