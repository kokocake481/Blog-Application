import { useState } from "react";
import { Home, PenTool, Sun, Moon, LogIn, LogOut } from "lucide-react";
import AuthModel from "./AuthModel.jsx";

export default function Navbar({
  currentView,
  setView,
  theme,
  toggleTheme,
  currentUser,
  setCurrentUser,
}) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const logout = () => {
    setCurrentUser(null);
    if (currentView === "write") {
      setView("home");
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo*/}
        <div
          onClick={() => setView("home")}
          className="flex items-center space-x-2 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="font-mono text-white font-bold text-lg">L</span>
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Lama
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Blog
            </span>
          </span>
        </div>

        {/* navigation Action */}
        <div className="flex items-center space-x-6">
          <nav
            className="hidden sm:flex items-center space-x-1"
            id="navbar-nav"
          >
            <button
              onClick={() => setView("home")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                currentView === "home"
                  ? "bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
              }
                        `}
              id="nav-home-btn"
            >
              <Home size={16} />
              <span>Homepage</span>
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setView("write");
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className={`
                            px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                              currentView === "write"
                                ? "bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                            }
                            `}
              id="nav-write-btn"
            >
              <PenTool size={16} />
              <span>Write</span>
            </button>
          </nav>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Theme & Auth Panel */}
          <div className="flex items-center space-x-3" id="navbar-controls">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              id="theme-toggle-btn"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-amber-400 animate-spin-slow" />
              ) : (
                <Moon size={18} className="text-indigo-600" />
              )}
            </button>

            {/* Quick Demo Auth Toggle */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 pl-2 pr-1 py-1 rounded-xl">
                <div className="hidden md:flex flex-col text-right pr-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium leading-none">
                    {currentUser.role === "admin" ? "ADMIN/AUTHER" : "MEMBER"}
                  </span>
                </div>
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/10 "
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{currentUser.name.charAt(0)}</div>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                  id="auth-logout-btn"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm shadow-blue-500/10"
                id="auth-login-btn"
                title="Sign up for a custom account or login as Admin instantly."
              >
                <LogIn size={14} />
                <span> Join/Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Small mobile bottom navigation bar*/}
      <div className="flex sm:hidden justify-center bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-900 px-4 py-2 gap-4 text-xs font-medium text-slate-500">
        <button onClick={() => setView("home")}    className={`flex items-center space-x-1 px-3 py-1 rounded-md ${currentView === 'home' ? 'bg-slate-200 dark:bg-slate-900 text-blue-600 font-semibold' : ''}`}
       >
          <Home size={14} />
          <span>Home</span>
        </button>
        <button
          onClick={() => {
            if (currentUser) {
              setView("write");
            } else {
              setIsAuthOpen(true);
            }
          }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md ${currentView === "write" ? "bg-slate-200 dark:bg-slate-900 text-blue-600 font-semibold" : ""}`}
        >
          {" "}
          <PenTool size={14} />
          <span> Write </span>
        </button>
      </div>
   {/* Interactive registration & login overlay model */}
      <AuthModel
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
     
    </header>
  );
}
