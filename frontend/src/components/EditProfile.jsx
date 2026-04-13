import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import { getProfileApi, updateProfileApi } from "../api/userApi";

const inputStyle = {
  width: "100%",
  border: "1px solid #e9e9e9",
  borderRadius: "4px",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  color: "#222222",
  backgroundColor: "#ffffff",
  boxSizing: "border-box"
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#222222",
  marginBottom: "6px"
};

const sectionStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e9e9e9",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "20px"
};

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
      setProfileUploaded(false);
      setCoverUploaded(false);
    });
  }, []);

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const submit = async e => {
    e.preventDefault();
    await updateProfileApi(formData);
    navigate("/profile");
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "680px", margin: "40px auto", padding: "0 24px 60px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#222222", margin: "0 0 28px" }}>
          Edit Profile
        </h2>

        {/* PHOTO UPLOADS */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>
            Photos
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <label style={{ cursor: "pointer" }}>
              <div style={{
                backgroundColor: profileUploaded ? "#e8f7f0" : "#1dbf73",
                color: profileUploaded ? "#1dbf73" : "#ffffff",
                border: profileUploaded ? "1.5px solid #1dbf73" : "none",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s"
              }}>
                {profileUploaded ? "Profile Picture Uploaded ✅" : "Upload Profile Picture"}
              </div>
              <input type="file" style={{ display: "none" }} onChange={e => uploadImage(e, "image")} />
            </label>

            <label style={{ cursor: "pointer" }}>
              <div style={{
                backgroundColor: coverUploaded ? "#e8f7f0" : "#1dbf73",
                color: coverUploaded ? "#1dbf73" : "#ffffff",
                border: coverUploaded ? "1.5px solid #1dbf73" : "none",
                borderRadius: "4px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s"
              }}>
                {coverUploaded ? "Cover Photo Uploaded ✅" : "Upload Cover Photo"}
              </div>
              <input type="file" style={{ display: "none" }} onChange={e => uploadImage(e, "cover")} />
            </label>
          </div>
        </div>

        {/* SKILLS */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>
            Skills
          </h3>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Skills I Offer</label>
            <input
              value={skillsOffered}
              onChange={e => { setSkillsOffered(e.target.value); setSkillsSaved(false); }}
              placeholder="e.g. React, Python, Photoshop (comma-separated)"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Skills I Require</label>
            <input
              value={skillsRequired}
              onChange={e => { setSkillsRequired(e.target.value); setSkillsSaved(false); }}
              placeholder="e.g. UI Design, Node.js (comma-separated)"
              style={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={saveSkills}
            style={{
              width: "100%",
              backgroundColor: skillsSaved ? "#e8f7f0" : "#1dbf73",
              color: skillsSaved ? "#1dbf73" : "#ffffff",
              border: skillsSaved ? "1.5px solid #1dbf73" : "none",
              borderRadius: "4px",
              padding: "11px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {skillsSaved ? "Skills Saved ✅" : "Save Skills"}
          </button>
        </div>

        {/* PROFILE INFO */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>
            Profile Information
          </h3>

          <form onSubmit={submit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" style={inputStyle} />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: "#1dbf73",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "11px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  marginTop: "4px",
                  transition: "background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
              >
                Save Profile Info
              </button>
            </div>
          </form>
        </div>

        {/* ADD COURSE */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>
            Add Course
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Course Title</label>
              <input
                placeholder="e.g. Introduction to React"
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Price (USD)</label>
              <input
                placeholder="e.g. 49"
                type="number"
                value={coursePrice}
                onChange={e => setCoursePrice(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Course Video</label>
              <label style={{ cursor: "pointer", display: "block" }}>
                <div style={{
                  backgroundColor: courseVideoSelected ? "#e8f7f0" : "#222222",
                  color: courseVideoSelected ? "#1dbf73" : "#ffffff",
                  border: courseVideoSelected ? "1.5px solid #1dbf73" : "none",
                  borderRadius: "4px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s"
                }}>
                  {courseVideoSelected ? "Video Selected ✅" : "Upload Course Video"}
                </div>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={e => {
                    setCourseVideo(e.target.files[0]);
                    setCourseVideoSelected(true);
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={addCourse}
              style={{
                backgroundColor: "#222222",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "11px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#444444"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#222222"}
            >
              Add Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
