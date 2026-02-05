import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import "./Profilemanagement.css";
import userStore from "../../store/MyStore";
import { Camera, Heart, MessageCircle, LogOut, Trash2, ArrowLeft, X } from "lucide-react"; 
import Navbar from "../Navigation/Navbar";
import CommentPopup from "../Comment/CommentPopup";
import { useNavigate } from "react-router-dom";
import { mycontext } from "../../store/MyContext";

// --- ZOOM MODAL COMPONENT ---
const ZoomModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div className="zoom-overlay" onClick={onClose}>
      <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
        <button className="zoom-close" onClick={onClose}>
          <X size={30} />
        </button>
        <img src={imageUrl} alt="Zoomed View" className="zoomed-image" />
      </div>
    </div>
  );
};

function ProfileManagement() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(mycontext);
  const {
    userName,
    userMobileNum,
    currentProfileUrl,
    updateDetails,
    updateProfilePhoto,
    fetchMyPost,
    LikePost,
    deletePost,
    logout,
  } = userStore();

  const [name, setName] = useState(userName || "");
  const [mobile, setMobile] = useState(userMobileNum || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(currentProfileUrl);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const [localPosts, setLocalPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [likeLoadingIds, setLikeLoadingIds] = useState({});
  const [deleteLoadingIds, setDeleteLoadingIds] = useState({});
  const [zoomedImg, setZoomedImg] = useState(null);

  const loaderRef = useRef(null);
  const LIMIT = 5;

  // --- POST LOADING LOGIC ---
  const loadPosts = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetchMyPost(pageNum, LIMIT);
      if (res?.success) {
        const fetchedPosts = res.posts || [];
        setLocalPosts((prev) => (pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));
        if (fetchedPosts.length < LIMIT) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Fetch posts failed", err);
    } finally {
      setLoading(false);
    }
  }, [fetchMyPost]);

  // Initial Load
  useEffect(() => {
    loadPosts(1);
  }, []);

  // --- SCROLLING OBSERVER ---
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Load next page when page state changes
  useEffect(() => {
    if (page > 1) {
      loadPosts(page);
    }
  }, [page]);

  const handleLike = async (post) => {
    if (likeLoadingIds[post._id]) return;
    setLikeLoadingIds((prev) => ({ ...prev, [post._id]: true }));
    const previousLiked = post.isLiked;
    const previousLikes = post.TotalLikes;

    setLocalPosts((prev) =>
      prev.map((item) =>
        item._id === post._id
          ? {
              ...item,
              isLiked: !previousLiked,
              TotalLikes: previousLiked ? previousLikes - 1 : previousLikes + 1,
            }
          : item
      )
    );

    try {
      const res = await LikePost(post._id);
      if (!res?.success) throw new Error();
    } catch {
      setLocalPosts((prev) =>
        prev.map((item) =>
          item._id === post._id
            ? { ...item, isLiked: previousLiked, TotalLikes: previousLikes }
            : item
        )
      );
    } finally {
      setLikeLoadingIds((prev) => {
        const copy = { ...prev };
        delete copy[post._id];
        return copy;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpdate = async () => {
    if (!image) return alert("Please select a photo first");
    try {
      setLoadingPhoto(true);
      const res = await updateProfilePhoto(image);
      alert(res.msg || "Profile picture updated!");
      setImage(null);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleInfoUpdate = async () => {
    try {
      setLoadingInfo(true);
      const res = await updateDetails(name, mobile);
      if(res.success) alert(res.msg || "Personal details updated!");
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeleteLoadingIds((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await deletePost(postId);
        if (res.success) {
          setLocalPosts((prev) => prev.filter((post) => post._id !== postId));
          alert("Post deleted successfully");
        }
      } catch (err) {
        alert("Error deleting post");
      } finally {
        setDeleteLoadingIds((prev) => {
          const copy = { ...prev };
          delete copy[postId];
          return copy;
        });
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setIsLoggedIn(false);
      navigate("/login");
    }
  };

  return (
    <div className="profile-container-full">
      <div className="profile-navbar">
        <button className="nav-back-btn" onClick={() => navigate(-1)} title="Go back">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="nav-title">My Profile</h1>
        <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="profile-main-wrapper">
        <div className="profile-feed">
          {localPosts.map((post, index) => (
            <div key={post._id || index} className="post-card">
              <div className="post-header">
                <img
                  src={post.UserId?.profile || "https://via.placeholder.com/32"}
                  className="user-pic cursor-pointer"
                  alt="user"
                  onClick={() => setZoomedImg(post.UserId?.profile)}
                />
                <div className="user-info">
                  <div className="username">@{post.UserId?.username || "anonymous"}</div>
                  <div className="fullname">{post.UserId?.fullname || "User"}</div>
                </div>
              </div>

              <div className="post-content">
                {post.PostTitle && <div className="post-title">{post.PostTitle}</div>}
                {post.PostDescription && <div className="post-desc">{post.PostDescription}</div>}
                {post.PostImageUrl && (
                  <img 
                    src={post.PostImageUrl} 
                    className="post-image cursor-pointer" 
                    alt="post" 
                    onClick={() => setZoomedImg(post.PostImageUrl)}
                  />
                )}
              </div>

              <div className="post-actions">
                <button
                  disabled={likeLoadingIds[post._id]}
                  onClick={() => handleLike(post)}
                  className={`action-btn ${post.isLiked ? "liked" : ""}`}
                >
                  <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} strokeWidth={2} />
                  <span>{post.TotalLikes || 0}</span>
                </button>
                <button onClick={() => setCommentPostId(post._id)} className="action-btn">
                  <MessageCircle size={16} />
                  <span>{post.TotalComments || 0}</span>
                </button>
                <button
                  disabled={deleteLoadingIds[post._id]}
                  onClick={() => handleDeletePost(post._id)}
                  className="action-btn delete-btn-action"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* LOADER DIV - Important for Pagination */}
          <div ref={loaderRef} className="pagination-loader-profile">
             {loading && hasMore && <p>Loading more posts...</p>}
             {!hasMore && localPosts.length > 0 && <p>No more posts to show</p>}
          </div>
        </div>

        <div className="profile-wrapper">
          <div className="profile-container">
            <div className="settings-header">
              <h1 className="page-title" style={{color : '#fff'}}>Account Settings</h1>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <h3>Profile Picture</h3>
              </div>
              <div className="photo-body">
                <div className="image-preview-wrapper">
                  <img
                    src={preview || "https://via.placeholder.com/120"}
                    alt="profile"
                    className="profile-image cursor-pointer"
                    onClick={() => setZoomedImg(preview)}
                  />
                  <label className="upload-badge" htmlFor="file-input">
                    <span className="icon"><Camera /></span>
                    <input id="file-input" type="file" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
                <div className="photo-actions">
                  <button
                    className="btn-update photo-btn"
                    onClick={handlePhotoUpdate}
                    disabled={!image || loadingPhoto}
                  >
                    {loadingPhoto ? "Uploading..." : "Save New Photo"}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <h3>Personal Information</h3>
              </div>
              <div className="info-body">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <button className="btn-update info-btn" onClick={handleInfoUpdate} disabled={loadingInfo}>
                  {loadingInfo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {commentPostId && (
        <CommentPopup postId={commentPostId} onClose={() => setCommentPostId(null)} />
      )}
      <ZoomModal imageUrl={zoomedImg} onClose={() => setZoomedImg(null)} />
    </div>

    
  );
}

export default ProfileManagement;