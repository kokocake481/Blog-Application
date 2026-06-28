import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Calendar, Send, MessageSquare } from 'lucide-react';

export default function SinglePostView({ slug, onBack, currentUser }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loadingPost, setLoadingPost] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    // 1. Fetch full post details
    setLoadingPost(true);
    fetch(`/api/posts/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoadingPost(false);
        // 2. Load comments
        return fetch(`/api/comments?postSlug=${slug}`);
      })
      .then(res => res ? res.json() : [])
      .then(commentsData => {
        setComments(commentsData);
      })
      .catch(err => {
        console.error('Error loading article:', err);
        setLoadingPost(false);
      });
  }, [slug]);

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const parseContentToJSX = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    let isCodeBlock = false;
    let codeContent = [];

    return lines.map((line, idx) => {
      // Handle Multi-line Code Block
      if (line.trim().startsWith('```')) {
        if (isCodeBlock) {
          isCodeBlock = false;
          const content = codeContent.join('\n');
          codeContent = [];
          return (
            <pre 
              key={idx} 
              className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 border border-slate-800"
            >
              <code>{content}</code>
            </pre>
          );
        } else {
          isCodeBlock = true;
          return null;
        }
      }

      if (isCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Handle Headings
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white mt-8 mb-4">
            {line.substring(3)}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white mt-6 mb-3">
            {line.substring(4)}
          </h4>
        );
      }

      // Handle Bold text rendering
      let formattedLine = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = (
          <span>
            {parts.map((part, i) => (
              i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong> : part
            ))}
          </span>
        );
      }

      // Handle bullet lists
      if (line.trim().startsWith('- ')) {
        return (
          <ul key={idx} className="list-disc pl-6 my-2 text-slate-600 dark:text-slate-300">
            <li className="leading-relaxed text-sm sm:text-base">{formattedLine.toString().substring(2)}</li>
          </ul>
        );
      }

      if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
        return (
          <ol key={idx} className="list-decimal pl-6 my-2 text-slate-600 dark:text-slate-300">
            <li className="leading-relaxed text-sm sm:text-base">{formattedLine.toString().substring(3)}</li>
          </ol>
        );
      }

      // Regular paragraph rendering
      if (line.trim() === '') {
        return <div key={idx} className="h-3" />;
      }

      return (
        <p key={idx} className="text-slate-600 dark:text-slate-350 leading-relaxed text-sm sm:text-base my-3 font-sans">
          {formattedLine}
        </p>
      );
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);

    const payload = {
      postSlug: slug,
      desc: newComment.trim(),
      userEmail: currentUser?.email || 'anonymous@reader.com',
      userName: currentUser?.name || 'Anonymous Reader',
      userImage: currentUser?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error occurred.');
      }

      const freshComment = await res.json();
      setComments(prev => [freshComment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      setCommentError(err.message || 'Failed to publish comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="max-w-4xl mx-auto my-12 animate-pulse space-y-6" id="single-post-skeleton">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-64 sm:h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-4" id="single-post-error">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400">The requested post cannot be fetched or does not exist.</p>
        <button
          onClick={onBack}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-8" id={`single-article-${post.slug}`}>
      
      {/* Return button row */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
        id="post-back-btn"
      >
        <ArrowLeft size={14} />
        <span>Return to Feed</span>
      </button>

      {/* Header Info Banner Section */}
      <div className="space-y-5">
        <div className="flex items-center space-x-3 text-xs font-mono font-bold uppercase">
          <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-450 border border-blue-200/20">
            {post.catSlug}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Calendar size={13} className="mr-0.5" />
            {formatDate(post.createdAt)}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 flex items-center space-x-1">
            <Eye size={13} />
            <span>{post.views} Views</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* Author detail info card */}
        <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          {post.userImage && (
            <img
              src={post.userImage}
              alt={post.userName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-blue-500/10"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {post.userName}
            </div>
            <div className="text-xs text-slate-400 font-sans">
              Author • {post.userEmail}
            </div>
          </div>
        </div>
      </div>

      {/* Single post banner display photograph */}
      {post.img && (
        <div className="w-full h-64 sm:h-96 md:h-420px rounded-2xl relative overflow-hidden shadow-sm">
          <img
            src={post.img}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Structured formatted detail content body */}
      <article className="prose prose-blue max-w-none dark:prose-invert" id="article-content-body">
        <div className="space-y-4">
          {parseContentToJSX(post.desc)}
        </div>
      </article>

      {/* COMMENTS SECTIONS */}
      <section className="border-t border-slate-150 dark:border-slate-800 pt-10 mt-16 space-y-6" id="comments-section">
        <div className="flex items-center space-x-2">
          <MessageSquare size={20} className="text-blue-500" />
          <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
            Conversations ({comments.length})
          </h2>
        </div>

        {/* Comment creator text box */}
        <form onSubmit={handleCommentSubmit} className="space-y-3" id="comments-form">
          {commentError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
              {commentError}
            </div>
          )}

          <div className="flex items-start space-x-3">
            {currentUser?.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover shrink-0 mt-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 mt-1">
                G
              </div>
            )}
            <div className="relative grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  currentUser
                    ? `Comment as ${currentUser.name}...`
                    : 'Write a public comment anonymously...'
                }
                required
                rows={3}
                className="w-full text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-y"
                id="comment-input"
              />
              <div className="flex justify-between items-center mt-2.5">
                <span className="text-[10px] text-slate-400">
                  {!currentUser && '⚡ You are commenting as Guest (Anonymous Mode).'}
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans flex items-center space-x-1 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Send size={11} />
                  <span>{submittingComment ? 'Sending...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Feed of other readers comments */}
        <div className="space-y-4 pt-4" id="comments-feed-list">
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/30 rounded-xl text-slate-400 text-xs">
              Be the first to share your thoughts on this story!
            </div>
          ) : (
            comments.map((comm) => (
              <div 
                key={comm.id} 
                className="flex items-start space-x-3 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 rounded-xl transition-colors"
                id={`comment-${comm.id}`}
              >
                {comm.userImage && (
                  <img
                    src={comm.userImage}
                    alt={comm.userName}
                    className="h-8 w-8 rounded-full object-cover mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {comm.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(comm.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                    {comm.desc}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
