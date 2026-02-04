import React, { useContext, useState } from "react";
import { Mail, Lock, ChevronRight, Clipboard,  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userStore from "../../store/MyStore";
import "./Login.css";
import { mycontext } from "../../store/MyContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = userStore();
  const { setIsLoggedIn } = useContext(mycontext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setErrors({
        email: !form.email ? "Email required" : null,
        password: !form.password ? "Password required" : null,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await login(form);
      if (result.success) {
        setIsLoggedIn(true);
      } else {
        window.alert(result.message);
      }
    } catch {
      window.alert("Check your internet connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="logo-box">
            <Clipboard size={28} />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to access your groceries</p>
        </div>

        <InputField
          label="EMAIL ADDRESS"
          icon={<Mail size={16} />}
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          error={errors.email}
          placeholder="alex@example.com"
        />

        <InputField
          label="PASSWORD"
          type="password"
          icon={<Lock size={16} />}
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          error={errors.password}
          placeholder="••••••••"
        />

        <div className="forgot-row">
          <span onClick={() => navigate("/forgot")}>Forgot password?</span>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Loading..." : <>Sign In <ChevronRight size={18} /></>}
        </button>

        <div className="login-footer">
          New here? <span onClick={() => navigate("/auth/signup")}>Create Account</span>
        </div>

      </div>
    </div>
  );
}

/* Reusable Input */
const InputField = ({ label, icon, error, type = "text", value, onChange, placeholder }) => (
  <div className="input-group">
    <label>{label}</label>
    <div className={`input-box ${error ? "error-border" : ""}`}>
      {icon}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
    {error && <span className="error-text">{error}</span>}
  </div>
);
