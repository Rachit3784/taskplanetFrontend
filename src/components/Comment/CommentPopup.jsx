import React, { useEffect, useState, useCallback } from "react";
import userStore from "../../store/MyStore";
import "./CommentPopup.css";
import { Trash2, X } from "lucide-react"; // Trash2 is cleaner for delete

function CommentPopup({ postId, onClose }) {
  const { addComment, loadComments, deleteComment, userModelID } = userStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    const res = await loadComments(postId, pageNum, 10);
    if (res.success) {
      if (res.comments.length < 10) setHasMore(false);
      setComments((prev) => (pageNum === 1 ? res.comments : [...prev, ...res.comments]));
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setComments([]);
    fetchComments(1);
  }, [postId]);

  useEffect(() => {
    if (page > 1) fetchComments(page);
  }, [page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 10 && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const res = await addComment(postId, text);
    if (res.success) {
      setComments((prev) => [res.comment, ...prev]);
      setText("");
    }
  };

  const handleDelete = async (commentId) => {
    const res = await deleteComment(postId, commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>

        <div className="comments-list" onScroll={handleScroll}>
          {comments.map((c) => (
            <div key={c.commentId} className="comment-item">
              <img src={c.userId?.profile || "/avatar.png"} alt="user" />
              <div className="comment-content-wrapper">
                <div className="comment-bubble">
                  <span className="username">@{c.userId?.username}</span>
                  <p className="comment-text">{c.comment}</p>
                </div>

                {/* Always Visible Delete Button for Owner */}
                {String(c.userId?._id || c.userId) === String(userModelID) && (
                  <button className="delete-btn" onClick={() => handleDelete(c.commentId)}>
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && <p className="info-text">Loading...</p>}
          {!hasMore && comments.length > 0 && <p className="info-text">You've reached the end.</p>}
        </div>

        <div className="comment-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="send-btn" onClick={handleSend} disabled={!text.trim() || loading}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentPopup;