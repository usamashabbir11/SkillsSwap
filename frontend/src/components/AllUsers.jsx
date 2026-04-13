import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllUsersApi, adminDeleteUserApi } from "../api/userApi";

const coverGradients = [
  "linear-gradient(135deg, #1dbf73 0%, #16a085 100%)",
  "linear-gradient(135deg, #3498db 0%, #1a6fb5 100%)",
  "linear-gradient(135deg, #9b59b6 0%, #6c3483 100%)",
  "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
  "linear-gradient(135deg, #1abc9c 0%, #0e8c72 100%)",
  "linear-gradient(135deg, #e74c3c 0%, #a93226 100%)",
];

const getGradient = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % coverGradients.length;
  return coverGradients[idx];
};

const matchColor = (pct) => {
  if (pct >= 70) return "#1dbf73";
  if (pct >= 40) return "#f39c12";
  return "#e74c3c";
};

const AllUsers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [nameFilter, setNameFilter] = useState(searchParams.get("q") || "");
  const [skillFilter, setSkillFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeChip, setActiveChip] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = loggedInUser?.role === "admin";

  const handleAdminDelete = async (userId) => {
    if (!window.confirm("Delete this user and all their data?")) return;
    await adminDeleteUserApi(userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsersApi();
        setUsers(result.data);
      } catch {
        navigate("/login");
      }
    };
    fetchUsers();
  }, [navigate]);

  // Extract unique skills from all users for category chips
  const allSkills = [...new Set(users.flatMap(u => u.skillsOffered || []))].slice(0, 14);

  const handleChipClick = (skill) => {
    if (activeChip === skill) {
      setActiveChip("");
      setSkillFilter("");
    } else {
      setActiveChip(skill);
      setSkillFilter(skill);
    }
  };

  const computeMatch = (targetUser) => {
    const myRequired = loggedInUser?.skillsRequired || [];
    const theirOffered = targetUser.skillsOffered || [];
    if (myRequired.length === 0) return 0;
    const matches = myRequired.filter(s =>
      theirOffered.some(o =>
        o.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(o.toLowerCase())
      )
    ).length;
    return Math.round((matches / myRequired.length) * 100);
  };

  const filteredUsers = users
    .filter((user) => {
      const name = nameFilter.trim().toLowerCase();
      const skill = skillFilter.trim().toLowerCase();
      const city = cityFilter.trim().toLowerCase();
      const matchesName = name === "" || user.name.toLowerCase().includes(name);
      const matchesSkill =
        skill === "" ||
        user.skillsOffered?.some((s) => s.toLowerCase().includes(skill)) ||
        user.skillsRequired?.some((s) => s.toLowerCase().includes(skill));
      const matchesCity = city === "" || user.city?.toLowerCase().includes(city);
      return matchesName && matchesSkill && matchesCity;
    })
    .sort((a, b) => (b.courses?.length || 0) - (a.courses?.length || 0));

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Navbar />

      {/* HERO SECTION */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        padding: "56px 24px 48px",
        textAlign: "center"
      }}>
        <h1 style={{
          color: "#ffffff",
          fontSize: "38px",
          fontWeight: 800,
          margin: "0 0 12px",
          letterSpacing: "-0.5px"
        }}>
          Find Your Perfect <span style={{ color: "#1dbf73" }}>Skill Match</span>
        </h1>
        <p style={{
          color: "#aaaaaa",
          fontSize: "16px",
          margin: "0 0 36px",
          maxWidth: "520px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          Swap knowledge, grow together. Browse talented users ready to teach and learn.
        </p>

        {/* SEARCH FILTERS */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "820px",
          margin: "0 auto"
        }}>
          {[
            { placeholder: "Search by name...", value: nameFilter, onChange: setNameFilter },
            {
              placeholder: "Search by skill...", value: skillFilter, onChange: (v) => {
                setSkillFilter(v);
                setActiveChip("");
              }
            },
            { placeholder: "Search by city...", value: cityFilter, onChange: setCityFilter },
          ].map(({ placeholder, value, onChange }) => (
            <input
              key={placeholder}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: "1px solid #e9e9e9",
                borderRadius: "4px",
                padding: "10px 16px",
                fontSize: "14px",
                outline: "none",
                minWidth: "220px",
                color: "#222222",
                backgroundColor: "#ffffff"
              }}
            />
          ))}
        </div>
      </div>

      {/* SKILL CATEGORY CHIPS */}
      {allSkills.length > 0 && (
        <div style={{
          borderBottom: "1px solid #f1f1f1",
          padding: "14px 28px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "12px", color: "#777777", fontWeight: 600, whiteSpace: "nowrap", marginRight: "4px" }}>
            Browse by:
          </span>
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleChipClick(skill)}
              style={{
                whiteSpace: "nowrap",
                padding: "6px 16px",
                borderRadius: "20px",
                border: activeChip === skill ? "2px solid #1dbf73" : "1.5px solid #e9e9e9",
                backgroundColor: activeChip === skill ? "#e8f7f0" : "#ffffff",
                color: activeChip === skill ? "#1dbf73" : "#555555",
                fontSize: "13px",
                fontWeight: activeChip === skill ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* RESULTS COUNT */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 28px 0" }}>
        <p style={{ fontSize: "14px", color: "#777777" }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* USER CARDS GRID */}
      <div style={{ maxWidth: "1100px", margin: "16px auto 60px", padding: "0 28px" }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: "36px", margin: "0 0 12px" }}>🔍</p>
            <p style={{ color: "#777777", fontSize: "15px" }}>No users match your search.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px"
          }}>
            {filteredUsers.map((user) => {
              const matchPct = computeMatch(user);
              return (
                <div
                  key={user._id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e9e9e9",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s, transform 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* COVER STRIP */}
                  <div style={{
                    height: "80px",
                    backgroundImage: user.coverImage
                      ? `url(http://localhost:5000${user.coverImage})`
                      : getGradient(user.name),
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }} />

                  {/* AVATAR */}
                  <div style={{ padding: "0 16px", marginTop: "-28px" }}>
                    <img
                      src={
                        user.profileImage
                          ? `http://localhost:5000${user.profileImage}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1dbf73&color=fff&size=56`
                      }
                      alt={user.name}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        border: "3px solid #ffffff",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>

                  {/* CARD BODY */}
                  <div style={{ padding: "8px 16px 16px" }}>
                    {/* Name + Course count */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#222222" }}>
                        {user.name}
                      </h3>
                      {user.courses?.length > 0 && (
                        <span style={{
                          fontSize: "11px",
                          color: "#777777",
                          backgroundColor: "#f5f5f5",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          whiteSpace: "nowrap"
                        }}>
                          {user.courses.length} course{user.courses.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {user.city && (
                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#777777" }}>
                        📍 {user.city}
                      </p>
                    )}

                    {/* MATCH BAR */}
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#777777" }}>Skill Match</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: matchColor(matchPct) }}>
                          {matchPct}%
                        </span>
                      </div>
                      <div style={{ height: "4px", backgroundColor: "#f1f1f1", borderRadius: "2px" }}>
                        <div style={{
                          height: "4px",
                          width: `${matchPct}%`,
                          backgroundColor: matchColor(matchPct),
                          borderRadius: "2px",
                          transition: "width 0.4s ease"
                        }} />
                      </div>
                    </div>

                    {/* SKILLS OFFERED TAGS */}
                    {user.skillsOffered?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                        {user.skillsOffered.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            style={{
                              backgroundColor: "#e8f4ff",
                              color: "#1a6fb5",
                              borderRadius: "20px",
                              fontSize: "11px",
                              padding: "3px 9px",
                              fontWeight: 500
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <span style={{ fontSize: "11px", color: "#777777", padding: "3px 2px" }}>
                            +{user.skillsOffered.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* SKILLS REQUIRED TAGS */}
                    {user.skillsRequired?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                        {user.skillsRequired.slice(0, 2).map(skill => (
                          <span
                            key={skill}
                            style={{
                              backgroundColor: "#fff0f0",
                              color: "#c0392b",
                              borderRadius: "20px",
                              fontSize: "11px",
                              padding: "3px 9px",
                              fontWeight: 500
                            }}
                          >
                            Needs: {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => navigate(`/users/${user._id}`)}
                        style={{
                          flex: 1,
                          backgroundColor: "#1dbf73",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "9px 16px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#19a463"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1dbf73"}
                      >
                        Visit Profile
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleAdminDelete(user._id)}
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "9px 14px",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "background 0.15s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c0392b"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#e74c3c"}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
