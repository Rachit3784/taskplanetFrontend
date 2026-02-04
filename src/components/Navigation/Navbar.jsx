import React from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import userStore from "../../store/MyStore";


const Navbar = () => {
  const navigate = useNavigate();
  const { currentProfileUrl, userName } = userStore();

  return (
    <div className="navbar">
      {/* LEFT — USER INFO */}
      <div className="nav-user" onClick={() => navigate("/manageProfile")}>
        <img
          src={
            currentProfileUrl ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="user"
          className="nav-avatar"
        />
        <span className="nav-username">{userName || "User"}</span>
      </div>

      {/* RIGHT — ADD POST BUTTON */}
      <button className="nav-add-btn" onClick={() => navigate("/createPost")}>
         Add Post
      </button>
    </div>
  );
};

export default Navbar;
