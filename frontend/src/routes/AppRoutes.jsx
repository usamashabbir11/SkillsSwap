import { Routes, Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/" replace />;
};

import LandingPage from "../pages/LandingPage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";

import AllUsers from "../components/AllUsers";
import UserProfile from "../components/UserProfile";
import EditProfile from "../components/EditProfile";

/* ✅ MISSING IMPORTS (THIS WAS THE BUG) */
import RequestsPage from "../pages/RequestsPage";
import NotificationsPage from "../pages/NotificationsPage";
import AdminDashboard from "../pages/AdminDashboard";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import SuggestionsPage from "../pages/SuggestionsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

      <Route path="/users" element={<AllUsers />} />
      <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

      {/* PHASE 6 */}
      <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* PHASE 13 */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* PHASE 14C */}
      <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />

      {/* PHASE 10 */}
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
    </Routes>
  );
};

export default AppRoutes;
