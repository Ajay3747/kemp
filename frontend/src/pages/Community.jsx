import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import Core from '../components/core';
import { Image, Search, X } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const userId = localStorage.getItem('userId');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const titleText = (post.title || '').toLowerCase();
    const contentText = (post.content || '').toLowerCase();
    return titleText.includes(q) || contentText.includes(q);
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_URL}?t=${timestamp}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching community posts:', err);
      setError('Failed to load community posts');
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert('Please login to post');
      return;
    }
    if (!title || !imageFile) {
      alert('Please provide product name and upload an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', imageFile);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to post to community');
      }

      setTitle('');
      setImageFile(null);
      setImagePreview('');
      setContent('');
      await fetchPosts();
      alert('Posted to community and notified all users!');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Delete post error:', err);
      setError(err.message);
    }
  };

  const handleLike = async (postId) => {
    if (!userId) {
      alert('Please login to like posts');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        throw new Error('Failed to like post');
      }
      const data = await res.json();
      setPosts((prev) => prev.map((p) => 
        p._id === postId ? { ...p, likes: data.likes } : p
      ));
    } catch (err) {
      console.error('Like post error:', err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!userId) {
      alert('Please login to comment');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ userId, text })
      });
      if (!res.ok) {
        throw new Error('Failed to add comment');
      }
      const data = await res.json();
      setPosts((prev) => prev.map((p) => 
        p._id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p
      ));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Render the Core animation component */}
        <Core />
        
        {/* The rest of the Community component code */}
        <div className="text-center mb-8 sm:mb-12 parallax-element">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-wide leading-tight mb-3 sm:mb-4 parallax-element">
            Campus Community Board
          </h1>
          <p className="text-base sm:text-lg text-gray-400 font-light max-w-2xl mx-auto parallax-element px-2">
            Connect with your peers. Post requests, share tips, and build a stronger community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-gray-500 flex-shrink-0" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Post Creation Section */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Product Name</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Product Image</label>
              <div className="relative">
                <label 
                  htmlFor="community-image-upload"
                  className="flex items-center justify-center w-full bg-gray-800 rounded-lg p-2.5 sm:p-3 text-gray-500 cursor-pointer hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 hover:border-yellow-400 text-xs sm:text-sm"
                >
                  <Image size={18} className="mr-2 text-yellow-400 flex-shrink-0" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Upload image'}</span>
                </label>
                <input
                  id="community-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <label className="text-xs sm:text-sm text-gray-400 mb-2 block">Description (optional)</label>
          <textarea
            className="w-full bg-gray-800 rounded-lg p-2.5 sm:p-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 resize-none"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add details..."
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-400 text-black font-bold py-2 px-4 sm:px-6 rounded-full text-sm hover:bg-yellow-500 transition-colors duration-300 disabled:opacity-60 w-full sm:w-auto"
            >
              {loading ? 'Posting...' : 'Post to Community'}
            </button>
          </div>
        </div>

        {/* Community Feed */}
        <div className="space-y-4 sm:space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-400 py-8 sm:py-12">
              {searchQuery ? 'No products match your search.' : 'No community posts yet.'}
            </div>
          ) : (
            filteredPosts.map(post => (
              <Post
                key={post._id}
                postId={post._id}
                user={{ name: post.username || 'User' }}
                content={post.content}
                title={post.title}
                imageUrl={post.imageUrl}
                time={new Date(post.createdAt).toLocaleString()}
                likes={post.likes || []}
                comments={post.comments || []}
                canDelete={userId === String(post.userId)}
                onDelete={() => handleDelete(post._id)}
                onLike={handleLike}
                onComment={handleComment}
                currentUserId={userId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}