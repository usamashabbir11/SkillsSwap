import { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.loginUser(formData);
      navigate("/profile");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      {error && <p className="text-red-600 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full border p-2" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2" />
        <button className="w-full bg-green-600 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
