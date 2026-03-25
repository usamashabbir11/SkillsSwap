import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPaymentApi } from "../api/userApi";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {status === "verifying" && (
        <p className="text-gray-600 text-lg">Verifying your payment...</p>
      )}

      {status === "success" && (
        <div className="bg-white shadow rounded p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your course has been unlocked. You can now access it on the user's profile.
          </p>
          <button
            onClick={() => navigate(ownerId ? `/users/${ownerId}` : "/users")}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Go to Course
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white shadow rounded p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">
            We could not verify your payment. If you were charged, please contact support.
          </p>
          <button
            onClick={() => navigate("/users")}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Back to Users
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
