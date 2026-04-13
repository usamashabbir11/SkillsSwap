import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAdminStatsApi } from "../api/userApi";

const statIcons = {
  "Total Users": "👥",
  "Swap Requests Sent": "🔄",
  "Completed Swaps": "✅",
  "Courses Uploaded": "🎓",
  "Reviews Given": "⭐"
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e9e9e9",
      borderRadius: "8px",
      padding: "28px 24px",
      textAlign: "center",
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
      {statIcons[label] || "📊"}
    </div>
    <p style={{
      fontSize: "42px",
      fontWeight: 800,
      color: "#1dbf73",
      margin: "0 0 8px",
      lineHeight: 1
    }}>
      {value}
    </p>
    <p style={{
      fontSize: "13px",
      color: "#777777",
      fontWeight: 500,
      margin: 0,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      {label}
    </p>
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
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      {/* HEADER BANNER */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
        padding: "40px 28px"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#1dbf73", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            Admin Panel
          </p>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 800, color: "#ffffff" }}>
            Platform Overview
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#aaaaaa" }}>
            Real-time stats for SkillsSwap marketplace
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "40px auto 60px", padding: "0 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "20px"
        }}>
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Swap Requests Sent" value={stats.totalSwapRequests} />
          <StatCard label="Completed Swaps" value={stats.totalCompletedSwaps} />
          <StatCard label="Courses Uploaded" value={stats.totalCourses} />
          <StatCard label="Reviews Given" value={stats.totalReviews} />
        </div>

        {/* DIVIDER */}
        <div style={{ borderTop: "1px solid #f1f1f1", margin: "40px 0" }} />

        {/* QUICK ACTIONS */}
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/users")}
              style={{
                backgroundColor: "#1dbf73",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate("/profile")}
              style={{
                backgroundColor: "#222222",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#222222"}
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
