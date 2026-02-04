import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ChevronLeft } from "lucide-react";
import userStore from "../../store/MyStore";
import "./Otp.css";
import { mycontext } from "../../store/MyContext";

/* ⏳ Timer */
const CountdownTimer = ({ start = 59, onComplete }) => {
  const [time, setTime] = useState(start);

  useEffect(() => {
    if (time === 0) {
      onComplete?.();
      return;
    }
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [time]);

  return (
    <div className="timer-row">
      <span>Didn't receive it? </span>
      <span className="timer-count">Resend in {time}s</span>
    </div>
  );
};

export default function Otp() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { email, username, fullname, password, gender, type = "Signup" } = state || {};
  const isForgetFlow = type.toLowerCase().includes("forget");

  const { verifyNewUser, createUser, verifyForgottedUser, forgetPasswordRequest } = userStore();
  const {setIsLoggedIn} = useContext(mycontext);
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputs = useRef([]);


  const handleChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };



  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return setError("Enter all 6 digits");

    try {
      let res;
      if (isForgetFlow) {res = await verifyForgottedUser({ email, code });}
      else {
        console.log("hi i am new varification")
        res = await verifyNewUser({ email, password, code });}

      if (res?.success) {
        if (isForgetFlow) navigate("/reset-password", { state: { email } });
        else {
          
          setIsLoggedIn(true);
          // navigate("/main/home", { state: { email, isNewUser: "yes" } });
        
        }
      } else setError(res?.message || "Invalid OTP");
    } catch {
      setError("Verification failed");
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setIsResendDisabled(true);
    inputs.current[0]?.focus();


    try {
      if (isForgetFlow) await forgetPasswordRequest(email);
      else await createUser({ email, username, fullname, password, gender });
      alert("New OTP sent!");
    } catch {
      alert("Failed to resend OTP");
      setIsResendDisabled(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>

        <div className="otp-header">
          <div className="icon-circle"><Mail size={28} /></div>
          <h2>Verify Email</h2>
          <p>Enter the 6-digit code sent to</p>
          <div className="email-pill">{email}</div>
        </div>

        <div className="otp-grid">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              value={d}
              maxLength={1}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              onFocus={() => setFocusedIndex(i)}
              className={`otp-input ${focusedIndex === i ? "focus" : ""} ${d ? "filled" : ""}`}
            />
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="verify-btn" onClick={handleVerify}>
          <ShieldCheck size={18} /> Verify & Continue
        </button>

        <div className="otp-footer">
          {isResendDisabled ? (
            <CountdownTimer onComplete={() => setIsResendDisabled(false)} />
          ) : (
            <span className="resend-text" onClick={handleResend}>Resend OTP</span>
          )}
        </div>

      </div>
    </div>
  );
}
