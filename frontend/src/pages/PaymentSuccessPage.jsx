import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPaymentApi } from "../api/userApi";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    verifyPaymentApi(sessionId)
      .then((res) => {
        setOwnerId(res.data.ownerId);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      {/* Logo at top */}
      <div
        onClick={() => navigate("/users")}
        style={{
          position: "fixed",
          top: "24px",
          left: "28px",
          cursor: "pointer",
          fontWeight: 800,
          fontSize: "22px",
          letterSpacing: "-0.5px"
        }}
      >
        <span style={{ color: "#222222" }}>Skills</span>
        <span style={{ color: "#1dbf73" }}>Swap</span>
      </div>

      {/* VERIFYING */}
      {status === "verifying" && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "52px",
            height: "52px",
            border: "4px solid #e9e9e9",
            borderTop: "4px solid #1dbf73",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 0.8s linear infinite"
          }} />
          <p style={{ color: "#777777", fontSize: "16px", margin: 0 }}>Verifying your payment...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* SUCCESS */}
      {status === "success" && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e9e9e9",
          borderRadius: "8px",
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            backgroundColor: "#e8f7f0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "32px"
          }}>
            ✅
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#222222", margin: "0 0 10px" }}>
            Payment Successful!
          </h1>
          <p style={{ fontSize: "14px", color: "#777777", margin: "0 0 28px", lineHeight: "1.6" }}>
            Your course has been unlocked. You can now access it on the user&apos;s profile.
          </p>

          <button
            onClick={() => navigate(ownerId ? `/users/${ownerId}` : "/users")}
            style={{
              backgroundColor: "#1dbf73",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "12px 32px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
          >
            Go to Course
          </button>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e9e9e9",
          borderRadius: "8px",
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            backgroundColor: "#fff0f0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "32px"
          }}>
            ❌
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#222222", margin: "0 0 10px" }}>
            Verification Failed
          </h1>
          <p style={{ fontSize: "14px", color: "#777777", margin: "0 0 28px", lineHeight: "1.6" }}>
            We could not verify your payment. If you were charged, please contact support.
          </p>

          <button
            onClick={() => navigate("/users")}
            style={{
              backgroundColor: "#222222",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "12px 32px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#222222"}
          >
            Back to Users
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
