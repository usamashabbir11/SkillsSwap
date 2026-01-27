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

  useEffect(() => {
    const loadCounts = async () => {
      const requests = await getIncomingRequestsApi();
      const notifications = await getNotificationsApi();

      // 🔑 COUNT ONLY PENDING REQUESTS
      const pendingRequests = requests.data.filter(
        r => r.status === "pending"
      );

      setRequestCount(pendingRequests.length);

      setNotificationCount(
        notifications.data.filter(n => !n.read).length
      );
    };

    loadCounts();
  }, []);

  const hideRequestBadge = location.pathname === "/requests";
  const hideNotificationBadge = location.pathname === "/notifications";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
      <div className="flex gap-4 items-center">
        <span className="font-semibold">Welcome {user?.name}</span>

        <button onClick={() => navigate("/profile")}>Profile</button>
        <button onClick={() => navigate("/users")}>All Users</button>

        <button onClick={() => navigate("/requests")} className="relative">
          Requests
          {!hideRequestBadge && requestCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-xs px-2 rounded-full">
              {requestCount}
            </span>
          )}
        </button>

        <button onClick={() => navigate("/notifications")} className="relative">
          Notifications
          {!hideNotificationBadge && notificationCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-xs px-2 rounded-full">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
