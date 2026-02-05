import React, { useEffect, useRef, useState, useCallback } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import "./Home.css";
import Navbar from "../Navigation/Navbar";
import userStore from "../../store/MyStore";
import CommentPopup from "../Comment/CommentPopup";

const ZoomModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div className="zoom-overlay" onClick={onClose}>
      <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
        <button className="zoom-close" onClick={onClose}>
          <X size={30} />
        </button>
        <img src={imageUrl} alt="Zoomed" className="zoomed-image" />
      </div>
    </div>
  );
};

function Home() {
  const { fetchPost, LikePost } = userStore();
  const [localPosts, setLocalPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [zoomedImg, setZoomedImg] = useState(null);
  const [likeLoadingIds, setLikeLoadingIds] = useState({});

  const loaderRef = useRef(null);
  const LIMIT = 10;

  const loadPosts = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetchPost(pageNum, LIMIT);
      if (res?.success) {
        const fetchedPosts = res.posts || [];
        setLocalPosts((prev) => (pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));
        if (fetchedPosts.length < LIMIT) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchPost]);

  // Initial Load
  useEffect(() => {
    loadPosts(1);
  }, []);

  // Pagination Observer
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 } // Threshold kam kiya taaki jaldi trigger ho
    );

    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Load next page when page state changes
  useEffect(() => {
    if (page > 1) {
      loadPosts(page);
    }
  }, [page, loadPosts]);

  const handleLike = async (post) => {
    if (likeLoadingIds[post._id]) return;
    setLikeLoadingIds((prev) => ({ ...prev, [post._id]: true }));
    const previousLiked = post.isLiked;
    const previousLikes = post.TotalLikes;

    setLocalPosts((prev) =>
      prev.map((item) =>
        item._id === post._id
          ? { ...item, isLiked: !previousLiked, TotalLikes: previousLiked ? previousLikes - 1 : previousLikes + 1 }
          : item
      )
    );

    try {
      const res = await LikePost(post._id);
      if (!res?.success) throw new Error();
    } catch {
      setLocalPosts((prev) =>
        prev.map((item) =>
          item._id === post._id ? { ...item, isLiked: previousLiked, TotalLikes: previousLikes } : item
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

  return (
    <div className="home-container">
      <div className="nav-div">
        <Navbar />
      </div>
      <div className="feed">
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
                  className="post-image"
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
                <Heart size={16} fill={post.isLiked ? "red" : "none"} color={post.isLiked ? "red" : "currentColor"} strokeWidth={2} />
                <span>{post.TotalLikes || 0}</span>
              </button>
              <button onClick={() => setCommentPostId(post._id)} className="action-btn">
                <MessageCircle size={16} />
                <span>{post.TotalComments || 0}</span>
              </button>
            </div>
          </div>
        ))}

        {/* Loader Div - Isko height di hai taaki observe ho sake */}
        <div ref={loaderRef} className="pagination-loader">
          {loading && hasMore && <p>Loading more posts...</p>}
          {!hasMore && localPosts.length > 0 && <p className="end-msg">No more posts to show</p>}
        </div>
      </div>

      {commentPostId && <CommentPopup postId={commentPostId} onClose={() => setCommentPostId(null)} />}
      <ZoomModal imageUrl={zoomedImg} onClose={() => setZoomedImg(null)} />
    </div>
  );
}

export default Home;