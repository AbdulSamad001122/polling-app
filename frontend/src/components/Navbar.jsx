import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, PlusCircle, LayoutDashboard, Globe } from "lucide-react";

const NAV_LINKS_AUTHED = [
  { to: "/", label: "Create", icon: <PlusCircle className="w-4 h-4" /> },
  { to: "/my-polls", label: "My Polls", icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: "/news", label: "Explore", icon: <Globe className="w-4 h-4" /> },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-secondary/5 border-b border-secondary/10"
            : "bg-primary/80 backdrop-blur-md border-b border-secondary/8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-md shrink-0">
              <svg viewBox="0 0 64 64" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="40" width="10" height="16" rx="2.5" fill="#FFFFEB" opacity="0.45"/>
                <rect x="24" y="26" width="10" height="30" rx="2.5" fill="#FFFFEB" opacity="0.75"/>
                <rect x="40" y="12" width="10" height="44" rx="2.5" fill="#FFFFEB"/>
              </svg>
            </div>
            <span className="text-xl font-black text-secondary tracking-tight">Polra</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Show when="signed-in">
              {NAV_LINKS_AUTHED.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive(link.to)
                      ? "bg-secondary text-primary shadow-md"
                      : "text-secondary/70 hover:text-secondary hover:bg-secondary/8"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </Show>
            <Show when="signed-out">
              <Link
                to="/news"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive("/news")
                    ? "bg-secondary text-primary"
                    : "text-secondary/70 hover:text-secondary hover:bg-secondary/8"
                }`}
              >
                <Globe className="w-4 h-4" />
                Explore
              </Link>
            </Show>
          </div>

          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-secondary/20 hover:ring-secondary/50 transition-all",
                  },
                }}
              />
            </Show>

            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-secondary font-bold text-sm rounded-xl border-2 border-secondary/20 hover:border-secondary/50 hover:bg-secondary/5 transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-secondary text-primary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-secondary/20">
                    Join Free
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl text-secondary hover:bg-secondary/8 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-secondary/10 bg-white/98 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            <Show when="signed-in">
              {NAV_LINKS_AUTHED.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive(link.to)
                      ? "bg-secondary text-primary"
                      : "text-secondary hover:bg-secondary/8"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </Show>
            <Show when="signed-out">
              <Link to="/news" className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-secondary hover:bg-secondary/8">
                <Globe className="w-4 h-4" />
                Explore Community
              </Link>
              <div className="flex gap-2 pt-2 border-t border-secondary/10 mt-1">
                <SignInButton mode="modal">
                  <button className="flex-1 py-2.5 text-secondary font-bold text-sm rounded-xl border-2 border-secondary/20 hover:border-secondary/50 transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 py-2.5 bg-secondary text-primary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
                    Join Free
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        )}
      </nav>
    </>
  );
}
