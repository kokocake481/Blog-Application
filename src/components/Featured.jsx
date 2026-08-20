import { useEffect, useState } from "react";
import { Eye, Calendar, ArrowRight } from "lucide-react";

export default function Featured({ onReadPost }) {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/featured")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch featured post:", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="animate-pulse space-y-6 my-10 bg-slate-50 dark:bg-slate-900/10 p-6 rounded-3xl border border-slate-100 dark:border-slate-900"
        id="featured-skeleton"
      >
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-64 sm:h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!featuredPost) return null;

  return (
    <div className="my-10" id="featured-post-container">
      {/* Title section  matching Safak's gaint bold style */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight leading-none mb-10 text-slate-900 dark:text-white">
        <b> Hey, Lama Dev here! </b> Discover my creative stories and ideas.
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900/50 p-6 sm:p-8 rounded-3xl group shadow-sm hover:shadow-md transition-all duration-300">
        {/* Cover Image Area */}
        <div className="lg:col-span-7 overflow-hidden rounded-2xl relative min-h-[300px] lg:min-h-[400px]">
          {featuredPost.img && (
            <img
              src={featuredPost.img}
              alt={featuredPost.title}
              className=" absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
              referrerPolicy="no-referrer"
            />
          )}
          {/* Overlay tag */}
          <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm shadow ">
            Featured Article
          </div>
        </div>

        {/* Info details content spacing */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            {/* Meta row */}
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400 ">
              <span className="flex items-center space-x-1 ">
                <Calendar size={13} className="text-blue-500" />
                <span> {formatDate(featuredPost.createdAt )}</span>
              </span>
              <span>*</span>
              <span className="uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wider">
                {featuredPost.catSlug}
              </span>
              <span>*</span>
              <span className="flex items-center space-x-1">
                <Eye size={13} />
                <span>{featuredPost.views} views </span>
              </span>
            </div>

            {/* Title click route */}
            <h2
              onClick={() => onReadPost(featuredPost.slug)}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {featuredPost.title}
            </h2>

            {/* Excerpt */}
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
              {featuredPost.excerpt}
            </p>
          </div>

          {/* Auther info and action */}
          <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-5 ">
            <div className="flex items-center space-x-3">
              {featuredPost.userImage && (
                <img
                  src={featuredPost.userImage}
                  alt={featuredPost.userName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-900"
                  referrerPolicy="no-referrer"
                />
              )}

              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {featuredPost.userName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Auther
                </div>
              </div>
            </div>

            <button
              onClick={() => onReadPost(featuredPost.slug)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-slate-950 dark:hover:text-white rounded-xl text-xs font-bold font-sans flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm shadow-black/5"
            >
              <span> Read Full Article </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
