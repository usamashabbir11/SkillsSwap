import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { getNotificationsApi } from "../api/userApi";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getNotificationsApi();
      setNotifications(res.data);

      await axios.put(
        "http://localhost:5000/notifications/read",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
    };
    load();
  }, []);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#222222", margin: "0 0 6px" }}>
            Notifications
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#777777" }}>
            {notifications.length > 0
              ? `You have ${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        {notifications.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e9e9e9",
            borderRadius: "8px"
          }}>
            <p style={{ fontSize: "36px", margin: "0 0 12px" }}>🔔</p>
            <p style={{ margin: 0, color: "#777777", fontSize: "15px" }}>No notifications yet.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((n, i) => (
            <div
              key={n._id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e9e9e9",
                borderRadius: "8px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Icon */}
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#e8f7f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "16px"
              }}>
                🔔
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#222222", lineHeight: "1.5" }}>
                  {n.message}
                </p>
                {n.createdAt && (
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#aaaaaa" }}>
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                )}
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#1dbf73",
                  flexShrink: 0,
                  marginTop: "6px"
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
