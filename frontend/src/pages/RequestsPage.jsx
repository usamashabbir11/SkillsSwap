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
      // ✅ USE BACKEND STATUS DIRECTLY
      setRequests(res.data);
    };

    load();
  }, []);

  const respond = async (id, action) => {
    await respondToRequestApi(id, action);

    // ✅ UPDATE STATUS LOCALLY (NO REMOVAL)
    setRequests(prev =>
      prev.map(r =>
        r._id === id ? { ...r, status: action } : r
      )
    );
  };

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Skill Swap Requests
        </h2>

        {requests.length === 0 && <p>No requests found.</p>}

        {requests.map(req => (
          <div
            key={req._id}
            className="bg-white shadow p-4 mb-4 rounded"
          >
            <p className="font-semibold">{req.from.name}</p>

            {/* ✅ PENDING */}
            {req.status === "pending" && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => respond(req._id, "accepted")}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(req._id, "rejected")}
                  className="bg-red-600 text-white px-4 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            )}

            {/* ✅ ACCEPTED */}
            {req.status === "accepted" && (
              <p className="mt-3 text-green-600 font-semibold">
                You accepted the request of {req.from.name} ✔️
              </p>
            )}

            {/* ✅ REJECTED */}
            {req.status === "rejected" && (
              <p className="mt-3 text-red-600 font-semibold">
                You rejected the request of {req.from.name} ❌
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default RequestsPage;
