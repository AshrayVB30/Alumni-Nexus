"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader as Loader } from "@/components/ui/Loader";
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, MoreHorizontal, Bookmark } from "lucide-react";

interface Post {
  _id: string;
  content: string;
  image_url?: string;
  author: {
    _id: string;
    name: string;
    designation?: string;
    profile_photo?: string;
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
  is_saved: boolean;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const fetchPosts = async () => {
    // In a real app, this would fetch from /api/posts
    setLoading(true);
    try {
      // Simulating API call for demonstration
      setTimeout(() => {
        setPosts([
          {
            _id: "1",
            content: "Just launched our new product! Super excited to share this with the Alumni Nexus community. We've been working on this for the past 6 months and it's finally live.",
            author: {
              _id: "u1",
              name: "Jane Smith",
              designation: "Product Manager at TechCorp",
            },
            likes_count: 124,
            comments_count: 18,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_liked: false,
            is_saved: false,
          },
          {
            _id: "2",
            content: "Looking for a React developer to join my startup. We are well-funded and building something amazing in the ed-tech space. DM me if interested!",
            author: {
              _id: "u2",
              name: "Alex Johnson",
              designation: "Founder & CEO",
            },
            likes_count: 45,
            comments_count: 12,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_liked: true,
            is_saved: false,
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      _id: Math.random().toString(),
      content: newPostContent,
      author: {
        _id: user?.id || "me",
        name: user?.name || "Me",
        designation: "Current User",
      },
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      is_liked: false,
      is_saved: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          is_liked: !p.is_liked,
          likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
        };
      }
      return p;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Create Post Box */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
          </div>
          <div className="flex-1">
            <form onSubmit={handlePostSubmit}>
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
                placeholder="Share an update, ask a question, or post a job..."
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex space-x-2">
                  <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4 mr-2" /> Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center text-sm text-gray-500 my-4">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        <span className="px-3">Sort by: Top</span>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 sm:p-6 pb-2 flex justify-between items-start">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {post.author.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight hover:underline cursor-pointer">
                      {post.author.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{post.author.designation}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.created_at)} • <span className="inline-flex items-center text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-gray-600 dark:text-gray-300">Public</span></p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 sm:px-6 py-2">
                <p className="text-gray-900 dark:text-gray-100 text-base whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Stats */}
              <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Heart className="h-3 w-3 fill-current" />
                  </span>
                  <span>{post.likes_count}</span>
                </div>
                <div>
                  <span className="hover:underline cursor-pointer">{post.comments_count} comments</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-2 py-2 flex items-center justify-between sm:justify-start sm:space-x-2">
                <button 
                  onClick={() => toggleLike(post._id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${post.is_liked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>Comment</span>
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
