import  { useState, useContext } from "react";
import { Mail, User, Lock, Hash, ChevronRight, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Signup.css";
import userStore from "../../store/MyStore";
import { mycontext } from "../../store/MyContext";

export default function Signup() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(mycontext);
  const { createUser } = userStore();

  const [form, setForm] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    let err = {};
    if (!form.email.includes("@")) err.email = "Invalid email address";
    if (!form.username.trim()) err.username = "Username required";
    if (!form.fullname.trim()) err.fullname = "Full name required";
    if (!form.password || form.password.length < 6) err.password = "Min. 6 characters";
    if (!form.gender) err.gender = "Selection required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await createUser(form);
      if (res?.success) {
        navigate("/auth/otp", { state: { ...form, type: "SignUP" } });
      } else {
        window.alert(res?.message || "Registration Failed");
      }
    } catch {
      window.alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo-badge">
            <Clipboard size={22} />
          </div>
          <h2>Create Account</h2>
          <p>Fill in your details to get started.</p>
        </div>

        <div className="signup-form">
          <InputField label="Email" icon={<Mail size={16} />} value={form.email} onChange={(v) => handleChange("email", v)} error={errors.email} />
          <InputField label="Username" icon={<User size={16} />} value={form.username} onChange={(v) => handleChange("username", v)} error={errors.username} />
          <InputField label="Full Name" icon={<Hash size={16} />} value={form.fullname} onChange={(v) => handleChange("fullname", v)} error={errors.fullname} />
          <InputField label="Password" type="password" icon={<Lock size={16} />} value={form.password} onChange={(v) => handleChange("password", v)} error={errors.password} />

          <div className="gender-section">
            <label>GENDER</label>
            <div className="gender-row">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  className={form.gender === g ? "gender-chip active" : "gender-chip"}
                  onClick={() => handleChange("gender", g)}
                  type="button"
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && <span className="error-small">{errors.gender}</span>}
          </div>

          <button className="signup-btn" onClick={handleSignup} disabled={loading}>
            {loading ? "Loading..." : <>Create Account <ChevronRight size={16} /></>}
          </button>

          <p className="login-link">
            Already a member? <span onClick={() => navigate("/auth/login")}>Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Reusable Input */
const InputField = ({ label, icon, error, type = "text", value, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <div className={`input-wrapper ${error ? "error-border" : ""}`}>
      {icon}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
    {error && <span className="error-text">{error}</span>}
  </div>
);
