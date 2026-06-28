import { useEffect, useState } from 'react';

export default function CategoryList({ activeCat, onSelectCat }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="my-8" id="category-list-skeleton">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Popular Categories</h2>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 w-28 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8" id="category-list-container">
      <h2 className="text-xl font-bold mb-5 font-sans tracking-tight text-slate-900 dark:text-white">
        Popular Categories
      </h2>

      <div className="flex flex-wrap gap-3">
        {/* 'All' filter item */}
        <button
          onClick={() => onSelectCat(null)}
          className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeCat === null
              ? 'bg-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
          id="cat-pill-all"
        >
          All Topics
        </button>

        {/* Dynamic Category Sliders */}
        {categories.map((cat) => {
          const isActive = activeCat === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCat(cat.slug)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] ' + cat.color
                  : 'hover:scale-[1.01] ' + cat.color
              }`}
              id={`cat-pill-${cat.slug}`}
            >
              {cat.img && (
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="h-6 w-6 rounded-full object-cover border border-black/5"
                  referrerPolicy="no-referrer"
                />
              )}
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
