import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStatsApi,
  getAllUsersApi,
  adminDeleteUserApi,
  getComplaintsApi,
  updateComplaintStatusApi
} from "../api/userApi";

/* ─── Sidebar nav items ─────────────────────────────── */
const NAV = [
  { section: "Overview", items: [{ label: "Dashboard", path: "/admin" }] },
  {
    section: "Management",
    items: [
      { label: "All Users", path: "/users" },
      { label: "Complaints", anchor: "complaints" },
      { label: "Courses", path: "/users" },
    ]
  },
  { section: "Settings", items: [{ label: "My Profile", path: "/profile" }] }
];

/* ─── Stat card ─────────────────────────────────────── */
const StatCard = ({ label, value, accent, trend }) => (
  <div style={{
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    flex: "1 1 200px"
  }}>
    <div style={{ height: "4px", backgroundColor: accent }} />
    <div style={{ padding: "20px 22px" }}>
      <p style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#1a1a2e" }}>{value ?? "—"}</p>
      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#777777", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: "12px", color: accent }}>{trend}</p>
    </div>
  </div>
);

/* ─── Status badge ──────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: "#fff8e1", text: "#f59f00" },
    resolved: { bg: "#e8f7f0", text: "#1dbf73" },
    dismissed: { bg: "#f1f1f1", text: "#888888" }
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      backgroundColor: c.bg, color: c.text, borderRadius: "12px",
      padding: "3px 10px", fontSize: "12px", fontWeight: 600,
      textTransform: "capitalize"
    }}>
      {status}
    </span>
  );
};

/* ─── Main component ────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => {
    if (!loggedInUser || loggedInUser.role !== "admin") {
      navigate("/users");
      return;
    }

    const load = async () => {
      try {
        const [statsRes, usersRes, complaintsRes] = await Promise.all([
          getAdminStatsApi(),
          getAllUsersApi(),
          getComplaintsApi()
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
        setComplaints(complaintsRes.data || []);
      } catch {
        navigate("/users");
      }
    };

    load();
  }, [navigate, loggedInUser?.role]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await adminDeleteUserApi(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  const handleComplaintAction = async (complaintId, status) => {
    try {
      const res = await updateComplaintStatusApi(complaintId, status);
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: res.data.status } : c))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed.");
    }
  };

  const scrollTo = (anchor) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (item) => {
    setActiveNav(item.label);
    if (item.anchor) {
      scrollTo(item.anchor);
    } else if (item.path && item.path !== "/admin") {
      navigate(item.path);
    }
  };

  if (!stats) return null;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  /* ── Dummy weekly signups bar chart data ── */
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const barHeights = [40, 65, 50, 80, 55, 30, 70];
  const maxBar = Math.max(...barHeights);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── DARK SIDEBAR ───────────────────────────────── */}
      <aside style={{
        width: "240px", minWidth: "240px", backgroundColor: "#1a1a2e",
        display: "flex", flexDirection: "column", position: "sticky",
        top: 0, height: "100vh", overflowY: "auto"
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>SkillsSwap</span>
            <span style={{
              backgroundColor: "#1dbf73", color: "#ffffff", fontSize: "10px",
              fontWeight: 700, borderRadius: "4px", padding: "2px 7px", letterSpacing: "0.5px"
            }}>ADMIN</span>
          </div>
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={{ marginBottom: "8px" }}>
              <p style={{
                margin: "12px 20px 4px", fontSize: "10px", fontWeight: 700,
                color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px"
              }}>
                {section}
              </p>
              {items.map((item) => {
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "9px 20px", fontSize: "13px", fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#1dbf73" : "rgba(255,255,255,0.65)",
                      backgroundColor: isActive ? "rgba(29,191,115,0.1)" : "transparent",
                      borderLeft: isActive ? "3px solid #1dbf73" : "3px solid transparent",
                      border: "none", cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom admin info */}
        <div style={{
          padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#1dbf73",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: 700, color: "#ffffff", flexShrink: 0
          }}>
            {(loggedInUser.name || "A")[0].toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
              {loggedInUser.name || "Admin"}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#1dbf73" }}>Administrator</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────── */}
      <div style={{ flex: 1, backgroundColor: "#f5f6fa", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          height: "56px", backgroundColor: "#ffffff", borderBottom: "1px solid #e9e9e9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 10
        }}>
          <h1 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1a1a2e" }}>
            Admin Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#777777" }}>
              Welcome back, <strong style={{ color: "#1a1a2e" }}>{loggedInUser.name || "Admin"}</strong>
            </span>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1dbf73",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#ffffff"
            }}>
              {(loggedInUser.name || "A")[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: "28px", flex: 1 }}>

          {/* ── STATS CARDS ─────────────────────────── */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
            <StatCard label="Total Users" value={stats.totalUsers} accent="#1dbf73" trend="Platform members" />
            <StatCard label="Total Swaps" value={stats.totalSwapRequests} accent="#3b82f6" trend="Swap requests sent" />
            <StatCard label="Total Courses" value={stats.totalCourses} accent="#8b5cf6" trend="Courses uploaded" />
            <StatCard label="Total Complaints" value={stats.totalComplaints} accent="#f59f00" trend="Reports submitted" />
          </div>

          {/* ── CHARTS + RECENT COMPLAINTS PREVIEW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>

            {/* Weekly signups bar chart */}
            <div style={{
              backgroundColor: "#ffffff", borderRadius: "10px",
              padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)"
            }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>
                Weekly Signups
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "100px" }}>
                {weekDays.map((day, i) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "100%", backgroundColor: "#1dbf73", borderRadius: "4px 4px 0 0",
                      height: `${(barHeights[i] / maxBar) * 90}px`, opacity: 0.85
                    }} />
                    <span style={{ fontSize: "10px", color: "#aaaaaa" }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent complaints preview */}
            <div style={{
              backgroundColor: "#ffffff", borderRadius: "10px",
              padding: "22px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden"
            }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>
                Recent Complaints
              </h3>
              {complaints.length === 0 ? (
                <p style={{ margin: 0, fontSize: "13px", color: "#aaaaaa" }}>No complaints yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr>
                      {["Reporter", "Reported", "Reason", "Status"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left", padding: "6px 8px", color: "#aaaaaa",
                          fontWeight: 600, borderBottom: "1px solid #f1f1f1"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 4).map((c) => (
                      <tr key={c._id}>
                        <td style={{ padding: "7px 8px", color: "#333" }}>{c.reporter?.name || "—"}</td>
                        <td style={{ padding: "7px 8px", color: "#333" }}>{c.reportedUser?.name || "—"}</td>
                        <td style={{ padding: "7px 8px", color: "#555" }}>{c.reason}</td>
                        <td style={{ padding: "7px 8px" }}><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── RECENT USERS TABLE ─────────────────── */}
          <div style={{
            backgroundColor: "#ffffff", borderRadius: "10px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "28px", overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f1f1" }}>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>
                All Users
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    {["User", "Email", "Courses", "City", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left", padding: "11px 16px", color: "#888888",
                        fontWeight: 600, fontSize: "12px", textTransform: "uppercase",
                        letterSpacing: "0.4px", borderBottom: "1px solid #f1f1f1"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #f9f9f9" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {getImageUrl(u.profileImage) ? (
                            <img
                              src={getImageUrl(u.profileImage)}
                              alt={u.name}
                              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%",
                              backgroundColor: "#1dbf73", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff"
                            }}>
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: "#222222" }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555555" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", color: "#555555" }}>{u.courses?.length || 0}</td>
                      <td style={{ padding: "12px 16px", color: "#555555" }}>{u.city || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#555555" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => navigate(`/users/${u._id}`)}
                            style={{
                              backgroundColor: "#f0faf5", color: "#1dbf73", border: "1px solid #1dbf73",
                              borderRadius: "4px", padding: "5px 12px", fontSize: "12px",
                              fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            style={{
                              backgroundColor: "#fff0f0", color: "#e53935", border: "1px solid #e53935",
                              borderRadius: "4px", padding: "5px 12px", fontSize: "12px",
                              fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── ALL COMPLAINTS TABLE ────────────────── */}
          <div
            id="complaints"
            style={{
              backgroundColor: "#ffffff", borderRadius: "10px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden"
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f1f1" }}>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>
                All Complaints
              </h2>
            </div>

            {complaints.length === 0 ? (
              <p style={{ margin: 0, padding: "24px", fontSize: "13px", color: "#aaaaaa" }}>
                No complaints submitted yet.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9f9f9" }}>
                      {["Reporter", "Reported User", "Reason", "Description", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left", padding: "11px 16px", color: "#888888",
                          fontWeight: 600, fontSize: "12px", textTransform: "uppercase",
                          letterSpacing: "0.4px", borderBottom: "1px solid #f1f1f1"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c._id} style={{ borderBottom: "1px solid #f9f9f9" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "12px 16px", color: "#222222", fontWeight: 500 }}>
                          {c.reporter?.name || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#222222", fontWeight: 500 }}>
                          {c.reportedUser?.name || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#555555" }}>{c.reason}</td>
                        <td style={{ padding: "12px 16px", color: "#777777", maxWidth: "180px" }}>
                          <span title={c.description} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.description || <em style={{ color: "#aaaaaa" }}>No description</em>}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusBadge status={c.status} />
                        </td>
                        <td style={{ padding: "12px 16px", color: "#777777" }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {c.status === "pending" ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleComplaintAction(c._id, "resolved")}
                                style={{
                                  backgroundColor: "#f0faf5", color: "#1dbf73", border: "1px solid #1dbf73",
                                  borderRadius: "4px", padding: "5px 10px", fontSize: "12px",
                                  fontWeight: 600, cursor: "pointer"
                                }}
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => handleComplaintAction(c._id, "dismissed")}
                                style={{
                                  backgroundColor: "#f5f5f5", color: "#888888", border: "1px solid #dddddd",
                                  borderRadius: "4px", padding: "5px 10px", fontSize: "12px",
                                  fontWeight: 600, cursor: "pointer"
                                }}
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#aaaaaa", fontStyle: "italic" }}>
                              Closed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
