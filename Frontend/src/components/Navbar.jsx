import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Film } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ Load user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, [location.pathname]); // refresh when route changes

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3">
        {/* 🎬 Logo / Brand */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide flex items-center gap-2 hover:text-indigo-200 transition"
        >
          <Film size={24} />
          MovieTracker
        </Link>

        {/* 🖥️ Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`hover:text-indigo-200 transition font-medium ${
              location.pathname === "/" ? "underline underline-offset-4" : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/reels"
            className={`hover:text-indigo-200 transition font-medium ${
              location.pathname === "/reels"
                ? "underline underline-offset-4"
                : ""
            }`}
          >
            Reels
          </Link>

          <Link
            to="/about"
            className={`hover:text-indigo-200 transition font-medium ${
              location.pathname === "/about"
                ? "underline underline-offset-4"
                : ""
            }`}
          >
            About
          </Link>

          {/* 👤 Logged-in state */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm">
                👋 {user.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-4 py-1 rounded-lg font-medium hover:bg-indigo-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-white px-4 py-1 rounded-lg font-medium hover:bg-indigo-500"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-700 text-white flex flex-col space-y-3 px-5 py-4">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/reels" onClick={() => setMenuOpen(false)}>
            Reels
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>

          {user ? (
            <>
              <span className="block bg-indigo-500 px-3 py-1 rounded-full text-sm text-center">
                👋 {user.name || "User"}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-white text-indigo-600 px-4 py-1 rounded-lg text-center font-medium hover:bg-indigo-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="border border-white px-4 py-1 rounded-lg text-center font-medium hover:bg-indigo-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
