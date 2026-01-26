import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getProfileApi, updateProfileApi } from "../api/userApi";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    city: ""
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getProfileApi();
        setFormData(result.data);
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
      await updateProfileApi(formData);
      navigate("/profile");
    } catch {
      setError("Update failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2" placeholder="Name" />
          <input name="email" value={formData.email} onChange={handleChange} className="w-full border p-2" placeholder="Email" />
          <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border p-2" placeholder="Bio" />
          <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2" placeholder="Phone" />
          <input name="city" value={formData.city} onChange={handleChange} className="w-full border p-2" placeholder="City" />

          <button className="w-full bg-green-600 text-white p-2">
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
