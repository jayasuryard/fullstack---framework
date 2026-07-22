import { Link, Outlet, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Docs', path: '/docs' },
];

export default function LandingLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">RF</div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-50">RyoFramework</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/app/login"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Sign in
            </Link>
            <Link
              to="/app/signup"
              className="btn-primary text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <main className={isHome ? '' : 'pt-16'}>
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 py-12 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">RF</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">RyoFramework</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} RyoForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
