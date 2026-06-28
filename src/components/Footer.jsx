export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="font-mono text-white font-bold text-base">L</span>
              </div>
              <span className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                Lama<span className="font-medium text-slate-500">Blog</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              A high-performance modern web journal designed for programmers, curators, designers, and creative minds. Share templates, insights, and elegant writeups effortlessly.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Explore Topics
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors pointer-events-none">
                  Coding Techniques
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors pointer-events-none">
                  Interaction Patterns
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors pointer-events-none">
                  Minimal Capsule Wardrobes
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors pointer-events-none">
                  Wanderlust Destinations
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              About the Creator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              This site is a pristine implementation of Lama Dev's design curriculum of full-stack blogs, converted for seamless presentation.
            </p>
            <div className="text-xs font-mono text-slate-400">
              Designed with React & Node.js
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/50 dark:border-slate-900/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 LamaBlog Project. All rights reserved.</p>
          <p className="mt-2 md:mt-0 font-mono">Build with Vite, Tailwind CSS v4 & Express</p>
        </div>
      </div>
    </footer>
  );
}
