import { useEffect, useState, useRef } from "react";
import { Eye, Calendar, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export default function CardList({ activeCat, onReadPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const listRef = useRef(null);
  const limit = 4;

  useEffect(() => {
    // Reset page to 1 whenever category changes
    setPage(1);
  }, [activeCat]);

  useEffect(() => {
    setLoading(true);

    let url = `/api/posts?page=${page}&limit=${limit}`;
    if (activeCat) {
      url += `&cat=${activeCat}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setHasPrev(data.hasPrev);
        setHasNext(data.hasNext);
        setTotalCount(data.totalCount);
        setLoading(false);

        // Smooth scroll to list when paginating
        if (page > 1 && listRef.current) {
          listRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      })
      .catch((err) => {
        console.error("Error loading posts list:", err);
        setLoading(false);
      });
  }, [page, activeCat ]);

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div ref={listRef} className="space-y-6" id="cardlist-main-section">
      <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
          {activeCat
            ? `Category: ${activeCat.toUpperCase()}`
            : "Recent Article"}
        </h2>
        <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50">
          Showing {posts.length} of {totalCount} matching
        </span>
      </div>

      {loading ? (
        <div className="space-y-6" id="cardlist-skeleton">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10"
            >
              <div className="w-full sm:w-48 h-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-xs text-slate-400 mt-1">
          <BookOpen
            size={40}
            className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
          />
          <p className="text-slate-500 dark:text-slate-400 font-sans font-medium text-sm">
            No articles published yet in this category.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Be the first to write and share an article here!
          </p>
        </div>
      ) : (
        <div className="space-y-6" id="cardlist-feed">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/20 transition-colors" id={`post-card-${post.slug}`}>
              {/* Card Image */}
              {post.img && (
                <div onClick={() => onReadPost(post.slug)} className="w-full sm:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}


              {/* Card Content detail */}
              <div className="flex flex-col justify-between grow space-y-3 py-1">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-[11px] font-mono font-semibold">
                    <span className="uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {post.catSlug}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">
                      *
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1 ">
                      <Calendar size={11} className="mr-0.5" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h3 onClick={() => onReadPost(post.slug)} className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 leading-snug transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900/50 pt-3 ">
                  <div className="flex items-center space-x-2">
                    {post.userImage && (
                      <img
                        src={post.userImage}
                        alt={post.userName}
                        className=""
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{post.userName}</span>
                  </div>
 
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{post.views} views</span>
                    </span>

                    <button onClick={() => onReadPost(post.slug)} className=" ">
                      <span>Read</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination control footer bar */}
      {totalCount > limit && (
        <div
          className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800 pt-6"
          id="pagination-footer"
        >
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={!hasPrev || loading}
            className={`px-4 py-2 border rounded-xl text-xs font-bold font-sans flex items-center space-x-1.5 transition-all ${
              hasPrev && !loading
                ? "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                : "border-slate-100 dark:border-slate-900 text-slate-300 dark:text-slate-700 pointer-events-none"
            }`}
            id="pag-prev-btn"
          >
            <ArrowLeft size={14} />
            <span> Previous</span>
          </button>

          <span className="text-xs font-mono font-medium text-slate-400">
            Page{" "}
            <strong className="text-slate-700 dark:text-slate-300">
              {page}
            </strong>
            of {Math.ceil(totalCount / limit)}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className={`px-4 py-2 border rounded-xl text-xs font-bold font-sans flex items-center space-x-1.5 transition-all 
                 ${
                   hasNext && !loading
                     ? "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                     : "border-slate-100 dark:border-slate-900 text-slate-300 dark:text-slate-700 pointer-events-none"
                 }`}
            id="pag-next-btn"
          >
            <span> Next </span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
