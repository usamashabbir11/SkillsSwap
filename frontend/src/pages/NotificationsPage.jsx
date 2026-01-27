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

      /* mark as read when page opens */
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
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>

        {notifications.length === 0 && <p>No notifications</p>}

        {notifications.map(n => (
          <div key={n._id} className="bg-white shadow p-4 mb-2 rounded">
            {n.message}
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationsPage;
