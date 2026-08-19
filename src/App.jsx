import { useState, useEffect } from "react"
import Footer from "./components/Footer.jsx";
import CategoryList from "./components/CategoryList.jsx";
import WritePostView from "./components/WritePostView.jsx"
import SinglePostView from "./components/SinglePostView.jsx"
import Sidebar from "./components/Sidebar.jsx"
import CardList from "./components/CardList.jsx"
import Featured from "./components/Featured.jsx"
import Navbar from "./components/Navbar.jsx"


export default function App() {
  // Navigation: 'home' | 'write' | 'post:[slug]' (represented simply as specific view strings)
  const [currentView, setView] = useState("home");
  const [activeCat, setActiveCat] = useState(null);


  // Theme state: default 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("lama_blog_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  // Current session User state: preset to null (Viewer) by default, can log in mode as Admin
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("lama_blog_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("lama_blog_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("lama_blog_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("lama_blog_user");
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleReadPost = (slug) => {
     console.log("slug:", slug)
  console.log("view:", `post:${slug}`)
    setView(`post:${slug}`);
  };

  const handlePostCreated = (slug) => {
    setView(`post:${slug}`);
  };

  const handleSelectCat = (slug) => {
    setActiveCat(slug);
    if (currentView !== "home") {
      setView("home");
    }
  };

  return (
    <div className={theme === "dark" ? "dark" : ""} id="app-root-theme-wrapper">
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* Navigation Bar*/}
        <Navbar
          currentView={currentView}
          setView={setView}
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      

        {/* Global Content Chassis */}
        <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8">
          {currentView === "home" && (
            <div className="space-y-12" id="homepage-grid">
              {/* Highlight featured banner area (only on the very initial global view)*/}
              {activeCat === null && <Featured onReadPost={handleReadPost} />}
              {/*Slider for popular topic filter */}
              <CategoryList
                activeCat={activeCat}
                onSelectCat={handleSelectCat}
              />
              {/* Home feed columns: left= CardList, right= Sidebar*/}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/*1. Left Feed Side*/}
                <div className="lg:col-span-8">
                  <CardList activeCat={activeCat} onReadPost={handleReadPost} />
                </div>

                {/* 2. Right Sidebar Side*/}
                <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:dark:border-slate-900 lg:pl-10">
                  <Sidebar
                    onReadPost={handleReadPost}
                    activeCat={activeCat}
                    onSelectCat={handleSelectCat}
                  />
                </div>
              </div>
            </div>
          )}

          {currentView === "write" && (
            <WritePostView
              onBack={() => setView("home")}
              currentUser={currentUser}
              onPostCreated={handlePostCreated}
            />
          )}

          {currentView.startsWith("post:") && (
            <SinglePostView
              slug={currentView.replace("post:", "")}
              onBack={() => setView("home")}
              currentUser={currentUser}
            />
          )}

          {/* Professional Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
