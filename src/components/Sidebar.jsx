import { useEffect, useState } from 'react';
import { Eye, Flame, Award, Hash } from 'lucide-react';

export default function Sidebar({ onReadPost, activeCat, onSelectCat }) {
  const [popularPosts, setPopularPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load popular posts & categories in parallel
    Promise.all([
      fetch('/api/posts/popular').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([postsData, catsData]) => {
        setPopularPosts(postsData);
        setCategories(catsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading sidebar data:', err);
        setLoading(false);
      });
  }, []);

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse" id="sidebar-skeleton">
        <div className="space-y-4">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Define static Editor Picks matching Safak's blog layout style
  const editorPicks = popularPosts.slice(0, 3);

  return (
    <aside className="space-y-10" id="sidebar-container">
      
      {/* 1. What's Hot Section */}
      <section className="space-y-4" id="sidebar-hot-section">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-widest font-semibold flex items-center space-x-1">
            <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span>What's Tasty & Hot</span>
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Most Popular Stories
          </h2>
        </div>

        <div className="space-y-4">
          {popularPosts.map((post) => (
            <div 
              key={post.id} 
              className="group cursor-pointer border-b border-slate-100/30 dark:border-slate-900/30 pb-3 last:border-0 last:pb-0"
              onClick={() => onReadPost(post.slug)}
            >
              <div className="flex items-center space-x-2 text-[10px] font-mono font-bold uppercase mb-1">
                <span className={`px-1.5 py-0.5 rounded ${
                  post.catSlug === 'coding' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                  post.catSlug === 'design' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                  post.catSlug === 'style' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                }`}>
                  {post.catSlug}
                </span>
                <span className="text-slate-400">{formatDate(post.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400 font-medium">
                <span className="font-semibold">{post.userName}</span>
                <span>•</span>
                <span className="flex items-center space-x-0.5">
                  <Eye size={10} />
                  <span>{post.views}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Popular Tags Cloud */}
      <section className="space-y-4" id="sidebar-topics-section">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-widest font-semibold flex items-center space-x-1">
            <Hash size={12} className="text-blue-500" />
            <span>Discover by tag</span>
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Category Cloud
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = activeCat === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCat(isSelected ? null : cat.slug)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                #{cat.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Editors Pick Section */}
      <section className="space-y-4" id="sidebar-editors-section">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-widest font-semibold flex items-center space-x-1">
            <Award size={12} className="text-amber-500 fill-amber-500" />
            <span>Chosen by Editors</span>
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Featured Curations
          </h2>
        </div>

        <div className="space-y-4">
          {editorPicks.map((post) => (
            <div 
              key={`pick-${post.id}`} 
              className="flex items-start space-x-3 cursor-pointer group"
              onClick={() => onReadPost(post.slug)}
            >
              {post.img && (
                <img
                  src={post.img}
                  alt={post.title}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-250 shrink-0 group-hover:scale-102 transition-all"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-[9px] font-mono font-bold uppercase text-slate-400">
                  <span className="text-blue-600 dark:text-blue-400">{post.catSlug}</span>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

    </aside>
  );
}
