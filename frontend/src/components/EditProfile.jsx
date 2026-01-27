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

  /* COURSE STATE */
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseVideo, setCourseVideo] = useState(null);
  const [courseVideoSelected, setCourseVideoSelected] = useState(false);

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
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (type === "image") setProfileUploaded(true);
    if (type === "cover") setCoverUploaded(true);
  };

  /* SAVE SKILLS */
  const saveSkills = async () => {
    await axios.put(
      "http://localhost:5000/users/skills",
      {
        skillsOffered: skillsOffered.split(",").map(s => s.trim()).filter(Boolean),
        skillsRequired: skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setSkillsSaved(true);
  };

  /* ADD COURSE */
  const addCourse = async () => {
    const data = new FormData();
    data.append("title", courseTitle);
    data.append("price", coursePrice);
    data.append("video", courseVideo);

    await axios.post(
      "http://localhost:5000/users/courses",
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    setCourseTitle("");
    setCoursePrice("");
    setCourseVideo(null);
    setCourseVideoSelected(false);
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
          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded">
            Upload Profile Picture
            <input type="file" className="hidden" onChange={e => uploadImage(e, "image")} />
          </label>

          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded">
            Upload Cover Photo
            <input type="file" className="hidden" onChange={e => uploadImage(e, "cover")} />
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
        />

        <label className="font-semibold">Skills I Require</label>
        <input
          value={skillsRequired}
          onChange={e => {
            setSkillsRequired(e.target.value);
            setSkillsSaved(false);
          }}
          className="w-full border p-2 mb-4"
        />

        <button
          type="button"
          onClick={saveSkills}
          className={`w-full p-2 mb-6 text-white ${
            skillsSaved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {skillsSaved ? "Skills Saved ✅" : "Save Skills"}
        </button>

        {/* PROFILE INFO */}
        <form onSubmit={submit} className="space-y-3">
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2" />
          <input name="email" value={formData.email} onChange={handleChange} className="w-full border p-2" />
          <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border p-2" />
          <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2" />
          <input name="city" value={formData.city} onChange={handleChange} className="w-full border p-2" />

          <button className="w-full bg-green-600 text-white p-2">
            Save Profile Info
          </button>
        </form>

        {/* COURSES */}
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Add Course</h3>

          <input
            placeholder="Course Title"
            value={courseTitle}
            onChange={e => setCourseTitle(e.target.value)}
            className="w-full border p-2 mb-2"
          />

          <input
            placeholder="Price (USD)"
            type="number"
            value={coursePrice}
            onChange={e => setCoursePrice(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          {/* COURSE VIDEO UPLOAD */}
          <label
            className={`cursor-pointer block text-center px-4 py-2 rounded mb-3 text-white ${
              courseVideoSelected
                ? "bg-green-600"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {courseVideoSelected ? "Video Selected ✅" : "Upload Course Video"}
            <input
              type="file"
              className="hidden"
              onChange={e => {
                setCourseVideo(e.target.files[0]);
                setCourseVideoSelected(true);
              }}
            />
          </label>

          <button
            type="button"
            onClick={addCourse}
            className="w-full bg-purple-700 text-white p-2"
          >
            Add Course
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
