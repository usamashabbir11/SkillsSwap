import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getProfileApi, updateProfileApi, deleteOwnProfileApi } from "../api/userApi";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/users", icon: "🏠" },
  { label: "Edit Profile", path: "/profile/edit", icon: "✏️" },
  { label: "Explore", path: "/users", icon: "🔍" },
  { label: "AI Matches", path: "/suggestions", icon: "🤖" },
  { label: "Swap Requests", path: "/requests", icon: "🔄" },
  { label: "Notifications", path: "/notifications", icon: "🔔" },
];

const TABS = ["Personal Info", "Skills", "Location"];

const EditProfile = () => {
  const navigate = useNavigate();

  /* ── existing state ── */
  const [formData, setFormData] = useState({
    name: "", email: "", bio: "", phone: "", city: "", lat: "", lng: ""
  });
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [skillsSaved, setSkillsSaved] = useState(false);
  const [profileUploaded, setProfileUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── new state for UI ── */
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  /* ── refs for hidden file inputs ── */
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    getProfileApi().then(res => {
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        bio: res.data.bio || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        lat: res.data.location?.coordinates?.[1] || "",
        lng: res.data.location?.coordinates?.[0] || ""
      });
      setSkillsOffered(res.data.skillsOffered?.join(", ") || "");
      setSkillsRequired(res.data.skillsRequired?.join(", ") || "");
      setProfileImageUrl(getImageUrl(res.data.profileImage));
      setCoverImageUrl(getImageUrl(res.data.coverImage));
    });
  }, []);

  /* ── re-fetch image URLs after successful upload ── */
  useEffect(() => {
    if (profileUploaded) {
      getProfileApi().then(res => setProfileImageUrl(getImageUrl(res.data.profileImage)));
    }
  }, [profileUploaded]);

  useEffect(() => {
    if (coverUploaded) {
      getProfileApi().then(res => setCoverImageUrl(getImageUrl(res.data.coverImage)));
    }
  }, [coverUploaded]);

  /* ── existing functions (unchanged) ── */
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadImage = async (e, type) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (type === "image") setProfileUploading(true);
      if (type === "cover") setCoverUploading(true);
      const data = new FormData();
      data.append("image", file);
      await axios.put(
        `http://localhost:5000/users/profile/${type}`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (type === "image") { setProfileUploaded(true); setProfileUploading(false); }
      if (type === "cover") { setCoverUploaded(true); setCoverUploading(false); }
    } catch (err) {
      if (type === "image") setProfileUploading(false);
      if (type === "cover") setCoverUploading(false);
      alert("Upload failed: " + (err?.response?.data?.message || err.message));
    }
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg("Could not detect location. Please enter city manually.");
      return;
    }
    setLocationDetecting(true);
    setLocationMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const address = data.address;
          const area = address.suburb || address.neighbourhood || address.village || address.town || "";
          const existingCity = formData.city.trim();
          const fullLocation = area && existingCity ? `${area}, ${existingCity}` : area || existingCity;
          setFormData(prev => ({ ...prev, lat: lat.toString(), lng: lng.toString(), city: fullLocation }));
          setLocationMsg(`✅ Location detected: ${fullLocation}`);
        } catch {
          setLocationMsg("Could not detect location. Please enter city manually.");
        } finally {
          setLocationDetecting(false);
        }
      },
      () => { setLocationMsg("Could not detect location. Please enter city manually."); setLocationDetecting(false); }
    );
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    await updateProfileApi(formData);
    setSaving(false);
    navigate("/profile");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    await deleteOwnProfileApi();
    localStorage.clear();
    navigate("/");
  };

  /* ── derived ── */
  const firstName = formData.name?.split(" ")[0] || "User";
  const initials = formData.name
    ? formData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ── shared input style ── */
  const inp = {
    width: "100%", border: "1.5px solid #e8eaed", borderRadius: "6px",
    padding: "10px 13px", fontSize: "14px", outline: "none", color: "#222",
    backgroundColor: "#fff", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.15s"
  };
  const lbl = { display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" };
  const fieldWrap = { display: "flex", flexDirection: "column" };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f0f2f5", fontFamily: "inherit" }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <div style={{
        width: "240px", flexShrink: 0, backgroundColor: "#fff",
        borderRight: "1px solid #e8eaed", display: "flex", flexDirection: "column"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #e8eaed" }}>
          <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px", cursor: "pointer" }} onClick={() => navigate("/users")}>
            <span style={{ color: "#222" }}>Skills</span>
            <span style={{ color: "#1dbf73" }}>Swap</span>
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.label === "Edit Profile";
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "10px 20px", border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: isActive ? 600 : 400, textAlign: "left",
                  backgroundColor: isActive ? "#f0fff8" : "transparent",
                  color: isActive ? "#1dbf73" : "#444",
                  borderLeft: isActive ? "3px solid #1dbf73" : "3px solid transparent",
                  transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Delete Account */}
        {JSON.parse(localStorage.getItem("user"))?.role !== "admin" && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #e8eaed" }}>
            <button
              onClick={handleDeleteAccount}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "10px 0", border: "none", cursor: "pointer",
                backgroundColor: "transparent", color: "#e74c3c",
                fontSize: "14px", fontWeight: 500, textAlign: "left"
              }}
            >
              🗑️ Delete Account
            </button>
          </div>
        )}
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOP BAR */}
        <div style={{
          height: "56px", backgroundColor: "#fff", borderBottom: "1px solid #e8eaed",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0
        }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#222" }}>Edit Profile</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#555" }}>Hi, {firstName}</span>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              backgroundColor: "#1dbf73", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, flexShrink: 0
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>

          {/* ── PROFILE HEADER CARD ── */}
          <div style={{
            backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8eaed",
            overflow: "hidden", marginBottom: "20px"
          }}>
            {/* Cover photo area */}
            <div style={{
              height: "120px", position: "relative",
              backgroundColor: "#0f3460",
              backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : "linear-gradient(135deg, #1a1a2e, #0f3460)",
              backgroundSize: "cover", backgroundPosition: "center"
            }}>
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                style={{
                  position: "absolute", top: "10px", right: "12px",
                  backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)",
                  color: "#fff", border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "6px", padding: "5px 12px", fontSize: "12px",
                  fontWeight: 500, cursor: coverUploading ? "not-allowed" : "pointer"
                }}
              >
                {coverUploading ? "Uploading…" : coverUploaded ? "Cover Updated ✅" : "Change Cover"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => uploadImage(e, "cover")}
              />
            </div>

            {/* Avatar + info */}
            <div style={{ padding: "0 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{ position: "relative", marginTop: "-28px" }}>
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={formData.name}
                      style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        objectFit: "cover", border: "4px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "block"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "50%",
                      backgroundColor: "#1dbf73", border: "4px solid #fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "22px", fontWeight: 700, color: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                    }}>
                      {initials}
                    </div>
                  )}
                  {/* Pencil edit button */}
                  <button
                    onClick={() => profileInputRef.current?.click()}
                    disabled={profileUploading}
                    style={{
                      position: "absolute", bottom: "2px", right: "2px",
                      width: "22px", height: "22px", borderRadius: "50%",
                      backgroundColor: "#1dbf73", border: "2px solid #fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: profileUploading ? "not-allowed" : "pointer",
                      fontSize: "11px", padding: 0, lineHeight: 1
                    }}
                    title="Change profile picture"
                  >
                    ✏️
                  </button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={e => uploadImage(e, "image")}
                  />
                </div>

                {/* Name + email */}
                <div style={{ paddingBottom: "4px", marginTop: "8px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#222" }}>
                    {formData.name || "Your Name"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
                    {formData.email || "your@email.com"}
                  </div>
                  {profileUploading && (
                    <div style={{ fontSize: "12px", color: "#1dbf73", marginTop: "4px" }}>Uploading photo…</div>
                  )}
                  {profileUploaded && !profileUploading && (
                    <div style={{ fontSize: "12px", color: "#1dbf73", marginTop: "4px" }}>Photo updated ✅</div>
                  )}
                </div>
              </div>

              {/* TABS */}
              <div style={{
                display: "flex", gap: "0", marginTop: "20px",
                borderBottom: "1px solid #e8eaed"
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "10px 20px", border: "none", background: "none",
                      cursor: "pointer", fontSize: "14px", fontWeight: activeTab === tab ? 600 : 400,
                      color: activeTab === tab ? "#1dbf73" : "#666",
                      borderBottom: activeTab === tab ? "2px solid #1dbf73" : "2px solid transparent",
                      marginBottom: "-1px", transition: "all 0.15s"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── PERSONAL INFO TAB ── */}
          {activeTab === "Personal Info" && (
            <div style={{
              backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8eaed",
              padding: "24px", marginBottom: "20px"
            }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div style={fieldWrap}>
                    <label style={lbl}>Full Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" style={inp} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={lbl}>City</label>
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" style={inp} />
                  </div>
                </div>
                <div style={{ ...fieldWrap, marginBottom: "20px" }}>
                  <label style={lbl}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    style={{ ...inp, resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      backgroundColor: "#1dbf73", color: "#fff", border: "none",
                      borderRadius: "6px", padding: "10px 24px", fontSize: "14px",
                      fontWeight: 500, cursor: saving ? "not-allowed" : "pointer",
                      transition: "background 0.15s"
                    }}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    style={{
                      backgroundColor: "#fff", color: "#444",
                      border: "1.5px solid #e8eaed", borderRadius: "6px",
                      padding: "10px 24px", fontSize: "14px", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SKILLS TAB ── */}
          {activeTab === "Skills" && (
            <div style={{
              backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8eaed",
              padding: "24px", marginBottom: "20px"
            }}>
              <div style={{ ...fieldWrap, marginBottom: "14px" }}>
                <label style={lbl}>Skills I Offer</label>
                <input
                  value={skillsOffered}
                  onChange={e => { setSkillsOffered(e.target.value); setSkillsSaved(false); }}
                  placeholder="e.g. React, Python, Photoshop (comma-separated)"
                  style={{ ...inp, borderColor: "#3498db40" }}
                />
                <span style={{ fontSize: "12px", color: "#3498db", marginTop: "4px" }}>
                  Skills you can teach others
                </span>
              </div>
              <div style={{ ...fieldWrap, marginBottom: "20px" }}>
                <label style={lbl}>Skills I Require</label>
                <input
                  value={skillsRequired}
                  onChange={e => { setSkillsRequired(e.target.value); setSkillsSaved(false); }}
                  placeholder="e.g. UI Design, Node.js (comma-separated)"
                  style={{ ...inp, borderColor: "#e74c3c40" }}
                />
                <span style={{ fontSize: "12px", color: "#e74c3c", marginTop: "4px" }}>
                  Skills you want to learn
                </span>
              </div>
              <button
                onClick={saveSkills}
                style={{
                  width: "100%", backgroundColor: skillsSaved ? "#e8f7f0" : "#1dbf73",
                  color: skillsSaved ? "#1dbf73" : "#fff",
                  border: skillsSaved ? "1.5px solid #1dbf73" : "none",
                  borderRadius: "6px", padding: "11px", fontSize: "14px",
                  fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                {skillsSaved ? "Skills Saved ✅" : "Save Skills"}
              </button>
            </div>
          )}

          {/* ── LOCATION TAB ── */}
          {activeTab === "Location" && (
            <div style={{
              backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8eaed",
              padding: "24px", marginBottom: "20px"
            }}>
              <div style={{ ...fieldWrap, marginBottom: "20px" }}>
                <label style={lbl}>City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  style={inp}
                />
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationDetecting}
                style={{
                  backgroundColor: "#fff", color: "#1dbf73",
                  border: "1.5px solid #1dbf73", borderRadius: "6px",
                  padding: "10px 20px", fontSize: "14px", fontWeight: 500,
                  cursor: locationDetecting ? "not-allowed" : "pointer", transition: "all 0.15s"
                }}
              >
                {locationDetecting ? "Detecting…" : "📍 Detect My Location"}
              </button>
              {locationMsg && (
                <p style={{
                  margin: "12px 0 0", fontSize: "13px",
                  color: locationMsg.startsWith("✅") ? "#1dbf73" : "#e74c3c"
                }}>
                  {locationMsg}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
