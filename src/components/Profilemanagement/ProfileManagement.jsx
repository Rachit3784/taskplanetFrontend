import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import "./Profilemanagement.css";
import userStore from "../../store/MyStore";
import { Camera, Heart, MessageCircle, LogOut, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "../Navigation/Navbar";
import CommentPopup from "../Comment/CommentPopup";
import { useNavigate } from "react-router-dom";
import { mycontext } from "../../store/MyContext";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";



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

  // Profile management state
  const [name, setName] = useState(userName || "");
  const [mobile, setMobile] = useState(userMobileNum || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(currentProfileUrl);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Posts fetching state
  const [localPosts, setLocalPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [likeLoadingIds, setLikeLoadingIds] = useState({});
  const [deleteLoadingIds, setDeleteLoadingIds] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loaderRef = useRef(null);
  const LIMIT = 5;

  const loadPosts = useCallback(async (pageNum) => {
    setLoading(true);
    const res = await fetchMyPost(pageNum, LIMIT);

    if (res?.success) {
      const fetchedPosts = res.posts || [];

      setLocalPosts((prev) =>
        pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]
      );

      if (fetchedPosts.length < LIMIT) {
        setHasMore(false);
      }
    }
    setLoading(false);
  }, [fetchMyPost]);

  useEffect(() => {
    loadPosts(1);
  }, []);

  // Handle like functionality
  const handleLike = async (post) => {
    if (likeLoadingIds[post._id]) return;

    setLikeLoadingIds((prev) => ({ ...prev, [post._id]: true }));

    const previousLiked = post.isLiked;
    const previousLikes = post.TotalLikes;

    // Optimistic UI
    setLocalPosts((prev) =>
      prev.map((item) =>
        item._id === post._id
          ? {
              ...item,
              isLiked: !previousLiked,
              TotalLikes: previousLiked
                ? previousLikes - 1
                : previousLikes + 1,
            }
          : item
      )
    );

    try {
      const res = await LikePost(post._id);

      if (!res?.success) throw new Error();
    } catch {
      // Revert if API fails
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

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setIsLoadingMore(true);
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, isLoadingMore]);

  useEffect(() => {
    if (page > 1 && !loading && !isLoadingMore) {
      loadPosts(page);
      setIsLoadingMore(false);
    }
  }, [page, loadPosts, loading, isLoadingMore]);

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
      setImage(null); // Reset file state after success
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
      if(res.success){
 alert(res.msg || "Personal details updated!");
      }
     
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
        } else {
          alert(res.message || "Failed to delete post");
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
        {/* LEFT SIDE: POSTS FEED */}
        <div className="profile-feed">
          {localPosts.map((post, index) => (
            <div key={post._id || index} className="post-card">
              <div className="post-header">
                
               <Zoom>
  <img
    src={post.UserId?.profile || "https://via.placeholder.com/32"}
    className="user-pic"
    alt="user"
  />
</Zoom>

                <div className="user-info">
                  <div className="username">@{post.UserId?.username || "anonymous"}</div>
                  <div className="fullname">{post.UserId?.fullname || "User"}</div>
                </div>
              </div>

              <div className="post-content">
                {post.PostTitle && <div className="post-title">{post.PostTitle}</div>}
                {post.PostDescription && <div className="post-desc">{post.PostDescription}</div>}
               {post.PostImageUrl && (
  <Zoom>
    <img src={post.PostImageUrl} className="post-image" alt="post" />
  </Zoom>
)}

              </div>

              <div className="post-actions">
                <button
                  disabled={likeLoadingIds[post._id]}
                  onClick={() => handleLike(post)}
                  className={`action-btn ${post.isLiked ? "liked" : ""}`}
                >
                  <Heart
                    size={16}
                    fill={post.isLiked ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
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
                  title="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {commentPostId && (
            <CommentPopup
              postId={commentPostId}
              onClose={() => setCommentPostId(null)}
            />
          )}

          <div ref={loaderRef} style={{ height: 0 }} />
        </div>

        {/* RIGHT SIDE: PROFILE MANAGEMENT */}
        <div className="profile-wrapper">
          <div className="profile-container">
            <div className="settings-header">
              <h1 className="page-title">Account Settings</h1>
            </div>

            {/* SECTION 1: PHOTO UPDATION */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Profile Picture</h3>
                <p>Update your avatar and public photo.</p>
              </div>
              <div className="photo-body">
                <div className="image-preview-wrapper">
                  <Zoom>
  <img
    src={preview || "https://via.placeholder.com/120"}
    alt="profile"
    className="profile-image"
  />
</Zoom>

                  <label className="upload-badge" htmlFor="file-input">
                    <span className="icon"><Camera /></span>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                <div className="photo-actions">
                  {image && <p className="file-name-hint">New file selected</p>}
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

            {/* SECTION 2: INFO UPDATION */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                <p>Update your name and contact details.</p>
              </div>
              <div className="info-body">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    placeholder="John Doe"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    placeholder="+91 0000000000"
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                <button
                  className="btn-update info-btn"
                  onClick={handleInfoUpdate}
                  disabled={loadingInfo}
                >
                  {loadingInfo ? "Saving Details..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileManagement;