import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
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

  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [skillsSaved, setSkillsSaved] = useState(false);

  const [profileUploaded, setProfileUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);

  useEffect(() => {
    getProfileApi().then(res => {
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        bio: res.data.bio || "",
        phone: res.data.phone || "",
        city: res.data.city || ""
      });

      setSkillsOffered(res.data.skillsOffered?.join(", ") || "");
      setSkillsRequired(res.data.skillsRequired?.join(", ") || "");
    });
  }, []);

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* IMAGE UPLOAD */
  const uploadImage = async (e, type) => {
    const data = new FormData();
    data.append("image", e.target.files[0]);

    await axios.put(
      `http://localhost:5000/users/profile/${type}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    if (type === "image") setProfileUploaded(true);
    if (type === "cover") setCoverUploaded(true);
  };

  /* SAVE SKILLS */
  const saveSkills = async () => {
    await axios.put(
      "http://localhost:5000/users/skills",
      {
        skillsOffered: skillsOffered
          .split(",")
          .map(s => s.trim())
          .filter(Boolean),
        skillsRequired: skillsRequired
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setSkillsSaved(true);
  };

  /* SAVE PROFILE INFO */
  const submit = async e => {
    e.preventDefault();
    await updateProfileApi(formData);
    navigate("/profile");
  };

  return (
    <>
      <Navbar />

      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* IMAGE UPLOADS */}
        <div className="flex gap-4 mb-6">
          <label
            className={`cursor-pointer px-4 py-2 rounded text-white transition ${
              profileUploaded
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {profileUploaded
              ? "Profile Picture Uploaded ✅"
              : "Upload Profile Picture"}
            <input
              type="file"
              className="hidden"
              onChange={e => uploadImage(e, "image")}
            />
          </label>

          <label
            className={`cursor-pointer px-4 py-2 rounded text-white transition ${
              coverUploaded
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {coverUploaded
              ? "Cover Photo Uploaded ✅"
              : "Upload Cover Photo"}
            <input
              type="file"
              className="hidden"
              onChange={e => uploadImage(e, "cover")}
            />
          </label>
        </div>

        {/* SKILLS */}
        <label className="font-semibold">Skills I Offer</label>
        <input
          value={skillsOffered}
          onChange={e => {
            setSkillsOffered(e.target.value);
            setSkillsSaved(false);
          }}
          className="w-full border p-2 mb-2"
          placeholder="e.g. React, Node, MongoDB"
        />

        <label className="font-semibold">Skills I Require</label>
        <input
          value={skillsRequired}
          onChange={e => {
            setSkillsRequired(e.target.value);
            setSkillsSaved(false);
          }}
          className="w-full border p-2 mb-4"
          placeholder="e.g. UI Design, Marketing"
        />

        <button
          type="button"
          onClick={saveSkills}
          className={`w-full p-2 mb-6 text-white ${
            skillsSaved
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {skillsSaved ? "Skills Saved ✅" : "Save Skills"}
        </button>

        {/* PROFILE INFO */}
        <form onSubmit={submit} className="space-y-3">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Name"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Email"
          />
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Bio"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="Phone"
          />
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="City"
          />

          <button className="w-full bg-green-600 text-white p-2 hover:bg-green-700 transition">
            Save Profile Info
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
