import React, { useEffect, useRef, useState, useCallback } from "react";
import { Heart, MessageCircle } from "lucide-react"; 
import "./Home.css";
import Navbar from "../Navigation/Navbar";
import userStore from "../../store/MyStore";
import CommentPopup from "../Comment/CommentPopup";

function Home() {
  const { fetchPost ,LikePost} = userStore();
  const [localPosts, setLocalPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);

  const loaderRef = useRef(null);
  const LIMIT = 5;
  const [likeLoadingIds, setLikeLoadingIds] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);


  const loadPosts = useCallback(async (pageNum) => {
    setLoading(true);
    const res = await fetchPost(pageNum, LIMIT);

    if (res?.success) {
      const fetchedPosts = res.posts || [];
      
      setLocalPosts((prev) => (pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));

      if (fetchedPosts.length < LIMIT) {
        setHasMore(false);
      }
    }
    setLoading(false);
  }, [fetchPost]);

  useEffect(() => {
    loadPosts(1);
  }, []);

const handleLike = async (post) => {
  if (likeLoadingIds[post._id]) return;

  setLikeLoadingIds(prev => ({ ...prev, [post._id]: true }));

  const previousLiked = post.isLiked;
  const previousLikes = post.TotalLikes;

  setLocalPosts(prev =>
    prev.map(item =>
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
    setLocalPosts(prev =>
      prev.map(item =>
        item._id === post._id
          ? { ...item, isLiked: previousLiked, TotalLikes: previousLikes }
          : item
      )
    );
  } finally {
    setLikeLoadingIds(prev => {
      const copy = { ...prev };
      delete copy[post._id];
      return copy;
    });
  }
};



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
                className="user-pic" 
                alt="user" 
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
                <img src={post.PostImageUrl} className="post-image" alt="post" />
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
    fill={post.isLiked ? "red" : "none"}
    color={post.isLiked ? "red" : "currentColor"}
    strokeWidth={2}
  />
  <span>{post.TotalLikes || 0}</span>
</button>


            <button onClick={() => setCommentPostId(post._id)} className="action-btn">
  <MessageCircle size={16}/>
  <span>{post.TotalComments || 0}</span>
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
    </div>
  );
}

export default Home;