import React, { useState } from 'react';
import { UserCircle2, MessageSquare, Heart, Image as ImageIcon, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function Post({ 
  user, 
  content, 
  time, 
  likes = [], 
  comments = [], 
  title, 
  imageUrl, 
  canDelete, 
  onDelete,
  onLike,
  onComment,
  currentUserId,
  postId
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLiked = currentUserId && likes.includes(currentUserId);
  const likesCount = likes.length;
  const commentsCount = comments.length;

  const handleLike = () => {
    if (onLike) {
      onLike(postId);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !onComment) return;
    setSubmitting(true);
    await onComment(postId, commentText);
    setCommentText('');
    setSubmitting(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-6 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <UserCircle2 size={48} className="text-yellow-400 mr-4" />
        <div>
          <h4 className="text-white font-semibold text-lg">{user.name}</h4>
          <span className="text-gray-500 text-sm">{time}</span>
        </div>
      </div>
      
      {/* Post Content */}
      {title && (
        <h3 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <ImageIcon size={18} /> {title}
        </h3>
      )}
      <div className="text-gray-300 text-base leading-relaxed mb-4">
        <p>{content}</p>
      </div>

      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={title || 'Post image'}
            className="w-full rounded-lg object-cover max-h-80"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center text-gray-400 justify-between flex-wrap gap-3 border-t border-gray-800 pt-4">
        <button 
          onClick={handleLike}
          className={`flex items-center mr-6 transition-colors cursor-pointer ${isLiked ? 'text-red-500' : 'hover:text-yellow-400'}`}
        >
          <Heart size={20} className={`mr-2 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center hover:text-yellow-400 transition-colors cursor-pointer"
        >
          <MessageSquare size={20} className="mr-2" />
          <span className="font-medium">{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
          {showComments ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
          >
            <Trash2 size={18} /> Delete
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          {/* Add Comment */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              disabled={submitting}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-2">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={comment._id || index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircle2 size={24} className="text-yellow-400" />
                    <span className="text-white font-medium text-sm">{comment.username}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm pl-8">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}