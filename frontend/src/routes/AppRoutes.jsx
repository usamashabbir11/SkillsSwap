import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import AllUsers from "../components/AllUsers";
import UserProfile from "../components/UserProfile";
import EditProfile from "../components/EditProfile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/users" element={<AllUsers />} />
      <Route path="/users/:id" element={<UserProfile />} />
    </Routes>
  );
};

export default AppRoutes;
