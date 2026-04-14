import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getIncomingRequestsApi,
  getNotificationsApi
} from "../api/userApi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [requestCount, setRequestCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const loadCounts = async () => {
      const requests = await getIncomingRequestsApi();
      const notifications = await getNotificationsApi();

      const pendingRequests = requests.data.filter(r => r.status === "pending");
      setRequestCount(pendingRequests.length);
      setNotificationCount(notifications.data.filter(n => !n.read).length);
    };

    loadCounts();
  }, []);

  const hideRequestBadge = location.pathname === "/requests";
  const hideNotificationBadge = location.pathname === "/notifications";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/users${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ""}`);
  };

  const navLinkStyle = (path) => ({
    position: "relative",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 10px",
    fontSize: "14px",
    fontWeight: 500,
    color: location.pathname === path ? "#1dbf73" : "#222222",
    borderRadius: "4px",
    transition: "color 0.15s"
  });

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 1000,
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e9e9e9",
      height: "64px",
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      gap: "20px"
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate("/users")}
        style={{ cursor: "pointer", fontWeight: 800, fontSize: "22px", whiteSpace: "nowrap", letterSpacing: "-0.5px" }}
      >
        <span style={{ color: "#222222" }}>Skills</span>
        <span style={{ color: "#1dbf73" }}>Swap</span>
      </div>

      {/* Centered Search Bar */}
      <form
        onSubmit={handleSearch}
        style={{ flex: 1, maxWidth: "460px", margin: "0 auto" }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills or users..."
          style={{
            width: "100%",
            border: "1.5px solid #222222",
            borderRadius: "4px",
            padding: "8px 14px",
            fontSize: "14px",
            outline: "none",
            color: "#222222",
            backgroundColor: "#ffffff"
          }}
        />
      </form>

      {/* Right side nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "auto" }}>
        {user ? (
          <>
            <span style={{ color: "#777777", fontSize: "13px", marginRight: "6px", whiteSpace: "nowrap" }}>
              Hi, {user.name?.split(" ")[0]}
            </span>

            <button onClick={() => navigate("/profile")} style={navLinkStyle("/profile")}>
              Profile
            </button>

            <button onClick={() => navigate("/users")} style={navLinkStyle("/users")}>
              Explore
            </button>

            <button onClick={() => navigate("/suggestions")} style={navLinkStyle("/suggestions")}>
              AI Matches
            </button>

            <button
              onClick={() => navigate("/requests")}
              style={{ ...navLinkStyle("/requests") }}
            >
              Requests
              {!hideRequestBadge && requestCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}>
                  {requestCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/notifications")}
              style={{ ...navLinkStyle("/notifications") }}
            >
              Notifications
              {!hideNotificationBadge && notificationCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}>
                  {notificationCount}
                </span>
              )}
            </button>

            {user.role === "admin" && (
              <button onClick={() => navigate("/admin")} style={navLinkStyle("/admin")}>
                Admin
              </button>
            )}

            <button
              onClick={logout}
              style={{
                backgroundColor: "red",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                marginLeft: "8px",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "red"}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "1.5px solid #222222",
                borderRadius: "4px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                color: "#222222",
                transition: "all 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#222222"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#222222"; }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "#1dbf73",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                marginLeft: "8px",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
            >
              Join Free
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
