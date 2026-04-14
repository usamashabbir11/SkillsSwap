import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

/* ─── Static fallback profiles ─── */
const STATIC_PROFILES = [
  { _id: "s1", name: "Ahmad Raza",   skillsOffered: ["React", "Node.js"],          avgRating: 4.9, courses: [1,2,3] },
  { _id: "s2", name: "Fatima Khan",  skillsOffered: ["UI Design", "Figma"],         avgRating: 4.7, courses: [1,2] },
  { _id: "s3", name: "Usman Ali",    skillsOffered: ["Python", "Machine Learning"],  avgRating: 4.6, courses: [1,2,3,4] },
];

const initials = (name) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const avatarColors = ["#1dbf73","#3498db","#9b59b6","#e67e22","#e74c3c","#1abc9c"];
const avatarColor  = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

/* ─── Sub-components ─── */
const NavLink = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:"none", border:"none", cursor:"pointer", fontSize:"14px", fontWeight:500,
        color: hov ? "#1dbf73" : "#222222", padding:"6px 10px", transition:"color 0.15s" }}>
      {children}
    </button>
  );
};

const GhostBtn = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ backgroundColor: hov ? "rgba(255,255,255,0.1)" : "transparent", color:"#ffffff",
        border:"1.5px solid rgba(255,255,255,0.5)", borderRadius:"4px", padding:"11px 24px",
        fontSize:"14px", fontWeight:600, cursor:"pointer", transition:"background 0.15s" }}>
      {children}
    </button>
  );
};

const GreenBtn = ({ children, onClick, large }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ backgroundColor: hov ? "#19a463" : "#1dbf73", color:"#ffffff", border:"none",
        borderRadius:"4px", padding: large ? "14px 32px" : "11px 24px",
        fontSize: large ? "15px" : "14px", fontWeight:600, cursor:"pointer", transition:"background 0.15s" }}>
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ backgroundColor:"#ffffff", border:`1px solid ${hov ? "#1dbf73" : "#e9e9e9"}`,
        borderRadius:"8px", padding:"28px 24px", transition:"border-color 0.2s, box-shadow 0.2s",
        boxShadow: hov ? "0 4px 16px rgba(29,191,115,0.1)" : "none" }}>
      <div style={{ fontSize:"32px", marginBottom:"14px" }}>{icon}</div>
      <h3 style={{ margin:"0 0 8px", fontSize:"15px", fontWeight:700, color:"#222222" }}>{title}</h3>
      <p style={{ margin:0, fontSize:"13px", color:"#777777", lineHeight:"1.6" }}>{desc}</p>
    </div>
  );
};

/* ─── Input component ─── */
const FormInput = ({ type="text", placeholder, value, onChange }) => {
  const [hov, setHov] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={e => { e.target.style.borderColor="#1dbf73"; e.target.style.boxShadow="0 0 0 3px rgba(29,191,115,0.1)"; }}
      onBlur={e  => { e.target.style.borderColor="#e9e9e9";  e.target.style.boxShadow="none"; }}
      style={{ width:"100%", border:"1px solid #e9e9e9", borderRadius:"4px", padding:"11px 14px",
        fontSize:"14px", color:"#222", outline:"none", transition:"border-color 0.15s",
        boxSizing:"border-box", fontFamily:"inherit" }}
    />
  );
};

/* ════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [topUsers, setTopUsers]   = useState([]);
  const [modal, setModal]         = useState(null); // null | "login" | "register"
  const [activeTab, setActiveTab] = useState("login");

  /* login form */
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError,    setLoginError]    = useState("");
  const [loginLoading,  setLoginLoading]  = useState(false);

  /* register form */
  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError,    setRegError]    = useState("");
  const [regLoading,  setRegLoading]  = useState(false);

  /* fetch top users */
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/users/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = (res.data?.data || res.data || [])
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 3);
        setTopUsers(sorted);
      } catch { /* silent */ }
    };
    fetchTopUsers();
  }, []);

  /* close modal on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openModal = (tab) => {
    setModal(tab);
    setActiveTab(tab);
    setLoginError(""); setRegError("");
  };

  const closeModal = () => {
    setModal(null);
    setLoginEmail(""); setLoginPassword(""); setLoginError("");
    setRegName(""); setRegEmail(""); setRegPassword(""); setRegError("");
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setLoginError("Please fill in all fields."); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await axios.post(`${API}/users/login`, { email: loginEmail, password: loginPassword });
      const { token, user } = res.data.data || res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      closeModal();
      navigate("/users");
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Invalid email or password.");
    } finally { setLoginLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) { setRegError("Please fill in all fields."); return; }
    setRegLoading(true); setRegError("");
    try {
      await axios.post(`${API}/users/register`, { name: regName, email: regEmail, password: regPassword });
      const loginRes = await axios.post(`${API}/users/login`, { email: regEmail, password: regPassword });
      const { token, user } = loginRes.data.data || loginRes.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      closeModal();
      navigate("/users");
    } catch (err) {
      setRegError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally { setRegLoading(false); }
  };

  const displayProfiles = topUsers.length > 0 ? topUsers : STATIC_PROFILES;

  return (
    <div style={{ backgroundColor:"#ffffff", fontFamily:"'Segoe UI', -apple-system, sans-serif" }}>

      {/* Modal overlay */}
      {modal && (
    <div
      onClick={closeModal}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.65)",
        backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px" }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ display:"flex", width:"100%", maxWidth:"820px", borderRadius:"8px",
          overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>

        {/* LEFT DARK PANEL */}
        <div style={{ width:"45%", background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
          padding:"2.5rem", display:"flex", flexDirection:"column", justifyContent:"space-between",
          position:"relative", overflow:"hidden" }}>
          {/* decorative circles */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px",
            background:"rgba(29,191,115,0.08)", borderRadius:"50%" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"-40px", width:"160px", height:"160px",
            background:"rgba(29,191,115,0.05)", borderRadius:"50%" }} />

          <div style={{ position:"relative", zIndex:1 }}>
            {/* Logo */}
            <div style={{ fontSize:"22px", fontWeight:800, marginBottom:"2.5rem" }}>
              <span style={{ color:"#fff" }}>Skills</span>
              <span style={{ color:"#1dbf73" }}>Swap</span>
            </div>
            {/* Title */}
            <div style={{ fontSize:"24px", fontWeight:700, color:"#fff", lineHeight:1.3, marginBottom:"12px" }}>
              Success starts with the right{" "}
              <span style={{ color:"#1dbf73" }}>skills</span>
            </div>
            {/* Subtitle */}
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", lineHeight:1.6, marginBottom:"2rem" }}>
              Join thousands of learners trading skills and growing together on Pakistan's first skill exchange platform.
            </p>
            {/* Benefits */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {[
                ["Free skill swapping", "exchange your expertise for someone else's course"],
                ["Smart matching",      "find users whose skills perfectly complement yours"],
                ["Video courses",       "upload and share your knowledge with the community"],
                ["Verified reviews",    "build your reputation with honest ratings"],
              ].map(([bold, rest], i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, marginTop:"1px",
                    background:"rgba(29,191,115,0.2)", border:"1px solid rgba(29,191,115,0.35)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"11px", color:"#1dbf73", fontWeight:700 }}>✓</div>
                  <p style={{ margin:0, fontSize:"12px", color:"rgba(255,255,255,0.7)", lineHeight:1.55 }}>
                    <strong style={{ color:"#fff", fontWeight:600 }}>{bold}</strong> — {rest}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ position:"relative", zIndex:1, margin:0, fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2rem" }}>
            © 2026 SkillsSwap · Built for learners
          </p>
        </div>

        {/* RIGHT WHITE PANEL */}
        <div style={{ width:"55%", background:"#fff", padding:"2.5rem", position:"relative" }}>
          {/* Close */}
          <button onClick={closeModal}
            style={{ position:"absolute", top:"16px", right:"16px", background:"none", border:"none",
              fontSize:"22px", color:"#aaa", cursor:"pointer", lineHeight:1 }}>×</button>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"2px solid #e9e9e9", marginBottom:"1.75rem" }}>
            {[["login","Sign In"],["register","Create Account"]].map(([key,label]) => (
              <div key={key} onClick={() => { setActiveTab(key); setLoginError(""); setRegError(""); }}
                style={{ flex:1, textAlign:"center", padding:"10px", fontSize:"14px", cursor:"pointer",
                  color: activeTab===key ? "#1dbf73" : "#777",
                  borderBottom: activeTab===key ? "2px solid #1dbf73" : "2px solid transparent",
                  marginBottom:"-2px", fontWeight: activeTab===key ? 600 : 400,
                  transition:"color 0.15s" }}>
                {label}
              </div>
            ))}
          </div>

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <div>
              <h2 style={{ margin:"0 0 4px", fontSize:"22px", fontWeight:700, color:"#222" }}>Welcome back</h2>
              <p style={{ margin:"0 0 1.5rem", fontSize:"13px", color:"#777" }}>
                Don't have an account?{" "}
                <span onClick={() => setActiveTab("register")}
                  style={{ color:"#1dbf73", cursor:"pointer", fontWeight:600 }}>Join free</span>
              </p>
              <div style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#444", marginBottom:"5px" }}>Email address</label>
                <FormInput type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom:"20px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#444", marginBottom:"5px" }}>Password</label>
                <FormInput type="password" placeholder="Enter your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              </div>
              {loginError && <p style={{ margin:"0 0 12px", fontSize:"12px", color:"#e74c3c" }}>{loginError}</p>}
              <button onClick={handleLogin} disabled={loginLoading}
                style={{ width:"100%", background: loginLoading ? "#aaa" : "#1dbf73", color:"#fff", border:"none",
                  borderRadius:"4px", padding:"12px", fontSize:"15px", fontWeight:600, cursor: loginLoading ? "not-allowed" : "pointer" }}>
                {loginLoading ? "Signing in…" : "Sign In"}
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"18px 0" }}>
                <div style={{ flex:1, height:"1px", background:"#e9e9e9" }} />
                <span style={{ fontSize:"12px", color:"#aaa" }}>or</span>
                <div style={{ flex:1, height:"1px", background:"#e9e9e9" }} />
              </div>
              <button onClick={() => alert("Google login coming soon!")}
                style={{ width:"100%", border:"1px solid #e9e9e9", background:"#fff", borderRadius:"4px",
                  padding:"10px", fontSize:"13px", color:"#444", cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:"8px" }}>
                🌐 Continue with Google
              </button>
              <p style={{ textAlign:"center", marginTop:"20px", fontSize:"13px", color:"#777" }}>
                New to SkillsSwap?{" "}
                <span onClick={() => setActiveTab("register")}
                  style={{ color:"#1dbf73", cursor:"pointer", fontWeight:600 }}>Create a free account</span>
              </p>
            </div>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <div>
              <h2 style={{ margin:"0 0 4px", fontSize:"22px", fontWeight:700, color:"#222" }}>Create your account</h2>
              <p style={{ margin:"0 0 1.5rem", fontSize:"13px", color:"#777" }}>
                Already have an account?{" "}
                <span onClick={() => setActiveTab("login")}
                  style={{ color:"#1dbf73", cursor:"pointer", fontWeight:600 }}>Sign in</span>
              </p>
              <div style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#444", marginBottom:"5px" }}>Full name</label>
                <FormInput placeholder="Your full name" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#444", marginBottom:"5px" }}>Email address</label>
                <FormInput type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom:"20px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#444", marginBottom:"5px" }}>Password</label>
                <FormInput type="password" placeholder="Create a password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              </div>
              {regError && <p style={{ margin:"0 0 12px", fontSize:"12px", color:"#e74c3c" }}>{regError}</p>}
              <button onClick={handleRegister} disabled={regLoading}
                style={{ width:"100%", background: regLoading ? "#aaa" : "#1dbf73", color:"#fff", border:"none",
                  borderRadius:"4px", padding:"12px", fontSize:"15px", fontWeight:600, cursor: regLoading ? "not-allowed" : "pointer" }}>
                {regLoading ? "Creating account…" : "Create Account"}
              </button>
              <p style={{ textAlign:"center", marginTop:"20px", fontSize:"12px", color:"#aaa", lineHeight:1.5 }}>
                By joining, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
      )}

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position:"sticky", top:0, zIndex:1000, backgroundColor:"#ffffff",
        borderBottom:"1px solid #e9e9e9", height:"64px", display:"flex", alignItems:"center",
        padding:"0 48px", gap:"16px" }}>
        <div onClick={() => navigate("/")}
          style={{ cursor:"pointer", fontWeight:800, fontSize:"22px", letterSpacing:"-0.5px", marginRight:"auto" }}>
          <span style={{ color:"#222222" }}>Skills</span>
          <span style={{ color:"#1dbf73" }}>Swap</span>
        </div>
        <NavLink onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior:"smooth" })}>
          How it works
        </NavLink>
        <NavLink onClick={() => navigate("/users")}>Browse</NavLink>
        <button onClick={() => openModal("login")}
          style={{ backgroundColor:"transparent", color:"#222222", border:"1.5px solid #222222",
            borderRadius:"4px", padding:"8px 20px", fontSize:"13px", fontWeight:600, cursor:"pointer",
            marginLeft:"8px" }}
          onMouseEnter={e => e.currentTarget.style.borderColor="#1dbf73"}
          onMouseLeave={e => e.currentTarget.style.borderColor="#222222"}>
          Sign In
        </button>
        <button onClick={() => openModal("register")}
          style={{ backgroundColor:"#1dbf73", color:"#ffffff", border:"none", borderRadius:"4px",
            padding:"8px 20px", fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor="#19a463"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor="#1dbf73"}>
          Join Free
        </button>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding:"72px 48px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"60px", alignItems:"start" }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px",
            background:"rgba(29,191,115,0.15)", border:"1px solid rgba(29,191,115,0.3)",
            borderRadius:"20px", padding:"6px 14px", marginBottom:"24px" }}>
            <span style={{ fontSize:"14px" }}>✨</span>
            <span style={{ fontSize:"13px", fontWeight:600, color:"#1dbf73" }}>The skill exchange platform</span>
          </div>
          <h1 style={{ margin:"0 0 20px", fontSize:"44px", fontWeight:800, color:"#ffffff",
            lineHeight:1.15, letterSpacing:"-0.5px" }}>
            Trade skills.<br />
            Grow <span style={{ color:"#1dbf73" }}>together</span>.<br />
            Learn for free.
          </h1>
          <p style={{ margin:"0 0 36px", fontSize:"16px", color:"rgba(255,255,255,0.65)", lineHeight:1.65 }}>
            Connect with talented people, swap your expertise, and unlock courses — no money needed. Just skills.
          </p>
          <div style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
            <GreenBtn onClick={() => openModal("register")} large>Get Started Free</GreenBtn>
            <GhostBtn onClick={() => navigate("/users")}>Browse Skills</GhostBtn>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
            {[["500+","Active users"],["1.2k+","Skills swapped"],["300+","Courses shared"]].map(([num,label]) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"8px", padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", fontWeight:700, color:"#1dbf73" }}>{num}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          {[
            { ini:"HS", name:"Hadia Shabbir — Lahore",   quote:"I taught React and learned UI/UX design in return. Best platform for skill growth!" },
            { ini:"AK", name:"Abdul Kareem — Islamabad", quote:"Swapped Flutter skills for Python. Got a full course without spending a rupee." },
          ].map((t) => (
            <div key={t.ini} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"10px", padding:"14px 16px", display:"flex", gap:"12px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", flexShrink:0,
                background: avatarColor(t.name), display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff" }}>
                {t.ini}
              </div>
              <div>
                <p style={{ margin:"0 0 5px", fontSize:"12px", color:"rgba(255,255,255,0.75)", lineHeight:1.5, fontStyle:"italic" }}>
                  "{t.quote}"
                </p>
                <p style={{ margin:0, fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>{t.name}</p>
              </div>
            </div>
          ))}

          {/* Top rated profiles */}
          <div>
            <p style={{ margin:"0 0 8px", fontSize:"10px", color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>Top rated profiles</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {displayProfiles.map((u) => (
                <div key={u._id} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:"10px", padding:"10px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"50%", flexShrink:0,
                    background: avatarColor(u.name), display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff" }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</p>
                    <div style={{ display:"flex", gap:"4px", marginTop:"4px", flexWrap:"wrap" }}>
                      {(u.skillsOffered || []).slice(0,2).map((s) => (
                        <span key={s} style={{ background:"rgba(56,139,255,0.15)", color:"#93c5fd",
                          fontSize:"10px", padding:"2px 8px", borderRadius:"20px",
                          border:"0.5px solid rgba(56,139,255,0.2)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    {u.avgRating > 0 && (
                      <p style={{ margin:0, fontSize:"12px", color:"#ffbe00", fontWeight:700 }}>★ {u.avgRating.toFixed(1)}</p>
                    )}
                    <p style={{ margin:0, fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>
                      {u.courses?.length || 0} course{(u.courses?.length||0)!==1?"s":""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUSTED BY ══════════ */}
      <section style={{ backgroundColor:"#f9f9f9", borderTop:"1px solid #f1f1f1",
        borderBottom:"1px solid #f1f1f1", padding:"36px 48px", textAlign:"center" }}>
        <p style={{ margin:"0 0 24px", fontSize:"13px", color:"#aaaaaa", fontWeight:600,
          textTransform:"uppercase", letterSpacing:"1px" }}>Trusted by students from</p>
        <div style={{ display:"flex", gap:"40px", justifyContent:"center", flexWrap:"wrap", alignItems:"center" }}>
          {["FAST NUCES","LUMS","NUST","UET","COMSATS"].map((uni) => (
            <span key={uni} style={{ fontSize:"14px", fontWeight:700, color:"#bbbbbb", letterSpacing:"0.5px" }}>{uni}</span>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" style={{ backgroundColor:"#f9f9f9", padding:"80px 48px" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <p style={{ margin:"0 0 8px", fontSize:"13px", fontWeight:700, color:"#1dbf73",
              textTransform:"uppercase", letterSpacing:"1px" }}>Simple process</p>
            <h2 style={{ margin:"0 0 12px", fontSize:"30px", fontWeight:800, color:"#222222" }}>How it works</h2>
            <p style={{ margin:0, fontSize:"15px", color:"#777777" }}>Three easy steps to start swapping skills today</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"32px" }}>
            {[
              { step:"1", title:"Create your profile",  desc:"Sign up, add your skills, upload a course video, and tell others what you want to learn in return." },
              { step:"2", title:"Find your match",       desc:"Browse profiles, use smart filters, and find users whose offered skills match what you need." },
              { step:"3", title:"Exchange and learn",    desc:"Send a swap request, agree on courses to exchange, and start learning — completely free." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ backgroundColor:"#ffffff", border:"1px solid #e9e9e9",
                borderRadius:"8px", padding:"36px 28px", textAlign:"center" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", border:"2px solid #1dbf73",
                  display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px",
                  fontSize:"20px", fontWeight:800, color:"#1dbf73" }}>{step}</div>
                <h3 style={{ margin:"0 0 10px", fontSize:"16px", fontWeight:700, color:"#222222" }}>{title}</h3>
                <p style={{ margin:0, fontSize:"13px", color:"#777777", lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ backgroundColor:"#ffffff", padding:"80px 48px" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <p style={{ margin:"0 0 8px", fontSize:"13px", fontWeight:700, color:"#1dbf73",
              textTransform:"uppercase", letterSpacing:"1px" }}>Everything you need</p>
            <h2 style={{ margin:"0 0 12px", fontSize:"30px", fontWeight:800, color:"#222222" }}>Packed with powerful features</h2>
            <p style={{ margin:0, fontSize:"15px", color:"#777777" }}>A full platform built to make skill exchange seamless and rewarding</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
            <FeatureCard icon="🎬" title="Video Courses"    desc="Upload and share full video courses with your swap partner. High-quality content, no limits." />
            <FeatureCard icon="🔄" title="Skill Swapping"   desc="Request a swap with any user. Accept, reject, or negotiate — complete control over every exchange." />
            <FeatureCard icon="⭐" title="Reviews & Ratings" desc="Rate courses after completing a swap. Build trust and reputation through honest peer reviews." />
            <FeatureCard icon="💳" title="Course Purchase"  desc="Not ready to swap? Buy courses directly with Stripe. Secure, instant, and hassle-free." />
            <FeatureCard icon="🎯" title="Smart Matching"   desc="See your skill match percentage with every user so you can find the best swap partners fast." />
            <FeatureCard icon="🔔" title="Notifications"    desc="Get real-time alerts for swap requests, acceptances, and course unlocks. Never miss a deal." />
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section style={{ background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding:"88px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:"560px", margin:"0 auto" }}>
          <h2 style={{ color:"#ffffff", fontSize:"34px", fontWeight:800, margin:"0 0 14px", letterSpacing:"-0.3px" }}>
            Ready to start swapping skills?
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", margin:"0 0 36px", lineHeight:1.6 }}>
            Completely free to get started. No credit card required.
          </p>
          <GreenBtn onClick={() => openModal("register")} large>Create Free Account</GreenBtn>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ backgroundColor:"#222222", padding:"28px 48px", display:"flex",
        justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ fontWeight:800, fontSize:"18px", letterSpacing:"-0.3px" }}>
          <span style={{ color:"#ffffff" }}>Skills</span>
          <span style={{ color:"#1dbf73" }}>Swap</span>
        </div>
        <p style={{ margin:0, fontSize:"13px", color:"#777777" }}>© 2026 SkillsSwap. Built for learners, by learners.</p>
      </footer>

    </div>
  );
};

export default LandingPage;