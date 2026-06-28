import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'Coding Desk', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000' },
  { name: 'Warm Café Layout', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000' },
  { name: 'Travel Camera', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000' },
  { name: 'Minimalist Shelf', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000' },
  { name: 'Clean Desk Coffee', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000' }
];

export default function WritePostView({ onBack, currentUser, onPostCreated }) {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [img, setImg] = useState('');
  const [desc, setDesc] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setCatSlug(data[0].slug);
        }
      })
      .catch(err => console.error('Failed to load categories inside writer form:', err));
  }, []);

  const selectPresetImage = (url) => {
    setImg(url);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in mode as an author to publish articles.');
      return;
    }

    if (!title.trim() || !desc.trim() || !catSlug) {
      setError('Please fill in Name Title, Category and Article Body content.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      desc: desc.trim(),
      img: img.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000',
      catSlug,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userImage: currentUser.image
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Server returned an error.');
      }

      const postData = await res.json();
      setSuccess(true);
      setTimeout(() => {
        onPostCreated(postData.slug);
      }, 1500);
    } catch (err) {
      console.error('Error publishing post:', err);
      setError(err.message || 'Something went wrong while publishing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg text-center space-y-6" id="write-auth-restricted font-sans">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-md">
          <Info size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Author Mode Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Writing stories and ideas on LamaBlog is protected. Click the <strong>Join / Sign In</strong> button in the upper right corner to sign up or register as a registered author!
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 dark:bg-slate-850 dark:border-slate-800 dark:text-white dark:hover:bg-slate-850 rounded-xl text-center text-xs font-bold cursor-pointer transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-6" id="write-post-view">
      
      {/* Back Header panel */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
          id="write-back-btn"
        >
          <ArrowLeft size={14} />
          <span>Homepage</span>
        </button>
        <span className="text-xs font-semibold text-slate-400 font-mono">
          PUBLISHING CONTEXT: {currentUser.name.toUpperCase()}
        </span>
      </div>

      {success ? (
        <div className="p-8 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center rounded-3xl space-y-4" id="write-success-card">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Story Published!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Taking you to your brand new article...</p>
        </div>
      ) : (
        <form onSubmit={handlePublish} className="space-y-6" id="write-post-form">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Category SELECTOR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a catchy title..."
                required
                className="w-full text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white"
                id="write-title-input"
              />
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Category Slugs
              </label>
              <select
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="w-full h-62px text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                id="write-category-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug} className="dark:bg-slate-950 text-slate-900 dark:text-white">
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Image chooser or Custom Cover Image */}
          <div className="space-y-3 p-5 border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <ImageIcon size={14} className="text-blue-500" />
                <span>Featured Cover Image</span>
              </label>
              <span className="text-[10px] text-slate-400 font-sans">
                Paste any link or select presets
              </span>
            </div>

            <input
              type="url"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="w-full text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              id="write-image-input"
            />

            {/* Quick visual Presets */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/40">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Quick Gallery Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPresetImage(preset.url)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-all ${
                      img === preset.url
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Article Body Text Editor Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <span>Story Content (Markdown supported)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Supports headings (##), bold (**text**), lists, and code blocks
              </span>
            </div>

            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tell your story... Use markdown to format. Explain concepts clearly for visitors."
              required
              rows={12}
              className="w-full text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white resize-y font-sans"
              id="write-desc-input"
            />
          </div>

          {/* Action publishing Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-755 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer ${
                submitting ? 'opacity-80 pointer-events-none' : ''
              }`}
              id="write-publish-btn"
            >
              <Save size={14} />
              <span>{submitting ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
