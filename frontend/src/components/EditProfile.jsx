import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getProfileApi, updateProfileApi } from "../api/userApi";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getProfileApi();
        setFormData({
          name: result.data.name,
          email: result.data.email
        });
      } catch {
        navigate("/login");
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfileApi(formData);

      localStorage.setItem("user", JSON.stringify(result.data));
      navigate("/profile");
    } catch {
      setError("Update failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Name"
            required
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Email"
            required
          />

          <button className="w-full bg-green-600 text-white p-2">
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
