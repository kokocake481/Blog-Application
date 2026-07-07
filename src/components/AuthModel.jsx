import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const AVATAR_PRESETS = [
  { name: 'Casual Cool', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { name: 'Creative Designer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { name: 'Business Tech', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { name: 'Stylist Elegant', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { name: 'Adventure Travel', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
];

export default function AuthModel({ isOpen, onClose, onAuthSuccess }) {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');
  
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatar, setCustomAvatar] = useState('');

  // Status handlers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessMsg(null);
      setEmail('');
      setPassword('');
      setName('');
      setCustomAvatar('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
    setSuccessMsg(null);
  };

  const handleQuickDemoAdmin = () => {
    setEmail('safak@lama.dev');
    setPassword('admin');
    setMode('login');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const targetUrl = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password }
      : { 
          name, 
          email, 
          password, 
          image: customAvatar.trim() || avatar 
        };

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setSuccessMsg(mode === 'login' ? 'Welcome back! Logged in successfully.' : 'Account created! Welcome to the community.');
      onAuthSuccess(data);
      
      setTimeout(() => {
        onClose();
        // Reset states
        setName('');
        setEmail('');
        setPassword('');
        setCustomAvatar('');
        setSuccessMsg(null);
      }, 1500);

    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="top-20 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay filter */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Box Chassis */}
      <div 
        className="relative bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        id="auth-modal-window"
      >
        {/* Close Button handle */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-xl transition-colors"
          id="auth-modal-close"
        >
          <X size={18} />
        </button>

        {/* Modal headers info */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-11 w-11 rounded-2xl bg-linear-to-tr from-blue-600 to-purple-600 items-center justify-center shadow-lg shadow-blue-500/10">
            <Sparkles size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' ? 'Sign In to LamaBlog' : 'Create Custom Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' 
              ? 'Enter your credentials or use the admin mode preset.' 
              : 'Sign up to write custom articles and post comments under your own name!'
            }
          </p>
        </div>

        {/* Dynamic status feedback */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center space-x-2 mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center space-x-2 mb-4">
            <CheckCircle size={15} className="shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Forms block */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-modal-form">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-mono">
                Full Display Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Hopper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                placeholder="e.g. grace@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600  focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-mono">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type="password"
                required
                placeholder="Enter safe password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Registration Avatar Pickers */}
          {mode === 'register' && (
            <div className="space-y-3 p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200/55 dark:border-slate-850 rounded-2xl">
              <div>
                <label className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1 font-mono">
                  Select Profile Avatar:
                </label>
                <div className="flex items-center space-x-2">
                  {AVATAR_PRESETS.map((p, idx) => {
                    const isSelected = avatar === p.url && !customAvatar;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(p.url);
                          setCustomAvatar('');
                        }}
                        className={`relative rounded-full overflow-hidden h-9 w-9 border-2 transition-all cursor-pointer ${
                          isSelected ? 'border-blue-600 scale-105' : 'border-transparent'
                        }`}
                        title={p.name}
                      >
                        <img 
                          src={p.url} 
                          alt={p.name} 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200/30 dark:border-slate-800/40 pt-2 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                  Or Paste Custom Avatar Image Link:
                </span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <ImageIcon size={12} />
                  </span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customAvatar}
                    onChange={(e) => setCustomAvatar(e.target.value)}
                    className="w-full text-[10px] font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dialog Action buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center space-x-1"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Let\'s Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Modal Toggle or Seeder footer */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800/70 pt-4 flex flex-col items-center space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
            <button
              onClick={handleToggleMode}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1 cursor-pointer bg-transparent"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>

          {/* Quick-fill admin helper (extremely useful for continuing to test as Safak Lama) */}
          {mode === 'login' && (
            <button
              onClick={handleQuickDemoAdmin}
              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-mono font-medium transition-colors cursor-pointer"
              title="Instantly pre-fill Safak's administrator credentials to edit categories, posts or publish instantly!"
            >
              ⚡ Pre-fill Author Account (safak@lama.dev)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
