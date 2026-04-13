import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getIncomingRequestsApi,
  respondToRequestApi
} from "../api/userApi";

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getIncomingRequestsApi();
      setRequests(res.data);
    };
    load();
  }, []);

  const respond = async (id, action) => {
    await respondToRequestApi(id, action);
    setRequests(prev =>
      prev.map(r => r._id === id ? { ...r, status: action } : r)
    );
  };

  const statusBadge = (status) => {
    const styles = {
      pending: { backgroundColor: "#fff8e1", color: "#f39c12", border: "1px solid #f0d070" },
      accepted: { backgroundColor: "#e8f7f0", color: "#1dbf73", border: "1px solid #a8dfc4" },
      rejected: { backgroundColor: "#fff0f0", color: "#c0392b", border: "1px solid #e8b4b8" }
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#222222", margin: "0 0 6px" }}>
            Skill Swap Requests
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#777777" }}>
            Manage incoming swap requests from other users
          </p>
        </div>

        {requests.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e9e9e9",
            borderRadius: "8px"
          }}>
            <p style={{ fontSize: "36px", margin: "0 0 12px" }}>📬</p>
            <p style={{ margin: 0, color: "#777777", fontSize: "15px" }}>No swap requests yet.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {requests.map(req => (
            <div
              key={req._id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e9e9e9",
                borderRadius: "8px",
                padding: "20px 24px",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#1dbf73",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {req.from.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#222222" }}>
                      {req.from.name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#777777" }}>
                      Wants to swap skills with you
                    </p>
                  </div>
                </div>

                <span style={{
                  ...statusBadge(req.status),
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "capitalize"
                }}>
                  {req.status}
                </span>
              </div>

              {/* PENDING ACTIONS */}
              {req.status === "pending" && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={() => respond(req._id, "accepted")}
                    style={{
                      backgroundColor: "#1dbf73",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "9px 24px",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(req._id, "rejected")}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#c0392b",
                      border: "1.5px solid #e8b4b8",
                      borderRadius: "4px",
                      padding: "9px 24px",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "#fff0f0";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* ACCEPTED MESSAGE */}
              {req.status === "accepted" && (
                <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#1dbf73", fontWeight: 600 }}>
                  You accepted the request of {req.from.name} ✔️
                </p>
              )}

              {/* REJECTED MESSAGE */}
              {req.status === "rejected" && (
                <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#c0392b", fontWeight: 600 }}>
                  You declined the request of {req.from.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
