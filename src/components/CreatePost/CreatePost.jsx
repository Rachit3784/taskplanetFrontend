import React, { useState, useCallback } from "react";
import "./CreatePost.css";
import userStore from "../../store/MyStore";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

const CreatePost = () => {
  const navigate = useNavigate();
  const addPost = userStore((state) => state.addPost);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setImage(file);
      setShowCrop(true);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async () => {
    const img = new Image();
    img.src = preview;
    await new Promise((res) => (img.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], image.name, {
          type: "image/jpeg",
        });
        resolve(croppedFile);
      }, "image/jpeg");
    });
  };

  const handleCropDone = async () => {
    try {
      const croppedFile = await createCroppedImage();
      setImage(croppedFile);
      setPreview(URL.createObjectURL(croppedFile));
      setShowCrop(false);
    } catch (e) {
      console.error("Crop error:", e);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !image) return alert("Fill all fields and add image");
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

          {/* --- CROP MODAL START --- */}
          {preview && showCrop && (
            <div className="crop-modal">
              <div className="crop-container">
                <h3>Crop Your Image</h3>
                <div className="cropper-wrapper">
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="zoom-control">
                  <label>Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>

                <div className="crop-actions">
                  <button className="crop-btn cancel" onClick={() => setShowCrop(false)}>
                    Cancel
                  </button>
                  <button className="crop-btn done" onClick={handleCropDone}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* --- CROP MODAL END --- */}

          {!showCrop && (
            <>
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="preview" className="preview-img" />
                  <button className="change-img-btn" onClick={() => setPreview(null)}>Change Image</button>
                </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;