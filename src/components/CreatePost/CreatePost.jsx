import React, { useState } from "react";
import "./CreatePost.css";
import userStore from "../../store/MyStore";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();
  const addPost = userStore((state) => state.addPost);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title || !description) return alert("Fill all fields");
    setLoading(true);

    const res = await addPost(image, title, description);
    setLoading(false);

    if (res.success) {
      alert("Post uploaded 🚀");
      navigate("/");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-navbar">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="nav-title">Create Post</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="create-post-wrapper">
        <div className="create-post-card">
          <h2>Share Something</h2>

          {preview ? (
            <img src={preview} alt="preview" className="preview-img" />
          ) : (
            <label className="upload-box">
              <ImagePlus size={22} />
              <div>Add Image</div>
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label>
          )}

          <input
            type="text"
            placeholder="Post Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-input"
          />

          <textarea
            placeholder="Write something amazing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="post-textarea"
          />

          <button onClick={handleSubmit} disabled={loading} className="post-btn">
            {loading ? "Posting..." : "Post 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
