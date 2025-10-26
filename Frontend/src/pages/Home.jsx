import { useState, useEffect } from "react";
import { CheckCircle, Clock, Eye, XCircle, LayoutGrid, List } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [collapsed, setCollapsed] = useState({
    Watched: false,
    "In Progress": false,
    "Not Yet": false,
  });

  const API_KEY = import.meta.env.VITE_TMDB_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  const user = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  // 🧠 Load movies
  const reloadMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/movies/${user.id}`);
      const data = await res.json();
      setMovieList(data);
    } catch (error) {
      console.error("Error loading movies:", error);
    }
  };

  useEffect(() => {
    reloadMovies();
  }, []);

  // 🔍 Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add movie
  const addMovie = async (movie, status) => {
    const exists = movieList.some((m) => m.tmdb_id === movie.id);
    if (exists) return alert("Movie already in your list!");

    await fetch(`${API_URL}/api/movies/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        status,
      }),
    });
    reloadMovies();
  };

  // 🗑 Delete
  const deleteMovie = async (id) => {
    await fetch(`${API_URL}/api/movies/delete/${id}`, { method: "DELETE" });
    reloadMovies();
  };

  const getMoviesByStatus = (status) =>
    movieList.filter((m) => m.status === status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-300">
        🎬 My Movie Tracker
      </h1>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10"
      >
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 font-semibold px-6 py-3 rounded-lg transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* View Mode Toggle */}
      <div className="flex justify-center items-center mb-8 space-x-4">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg ${
            viewMode === "grid" ? "bg-indigo-600" : "bg-indigo-400/40"
          }`}
        >
          <LayoutGrid size={20} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg ${
            viewMode === "list" ? "bg-indigo-600" : "bg-indigo-400/40"
          }`}
        >
          <List size={20} />
        </button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-indigo-300">
              Search Results
            </h2>
            <button
              onClick={() => {
                setResults([]);
                setQuery("");
              }}
              className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition"
            >
              ❌ Clear
            </button>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                : "flex flex-col space-y-3"
            }
          >
            {results.map((movie) => (
              <div
                key={movie.id}
                className="bg-white/10 rounded-lg p-3 shadow-lg hover:scale-105 transition-transform flex flex-col sm:flex-row sm:items-center"
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.title}
                  className={`rounded-md mb-3 sm:mb-0 ${
                    viewMode === "grid"
                      ? "w-full h-48 object-cover"
                      : "w-20 h-28 mr-3 object-cover"
                  }`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base mb-2">
                    {movie.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addMovie(movie, "Watched")}
                      className="p-2 rounded-full bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => addMovie(movie, "In Progress")}
                      className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Clock size={18} />
                    </button>
                    <button
                      onClick={() => addMovie(movie, "Not Yet")}
                      className="p-2 rounded-full bg-gray-500 hover:bg-gray-600"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movie Lists */}
      <div className="max-w-6xl mx-auto">
        {["Watched", "In Progress", "Not Yet"].map((status) => {
          const movies = getMoviesByStatus(status);
          return (
            <div key={status} className="mb-10">
              <button
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [status]: !prev[status],
                  }))
                }
                className="flex items-center justify-between w-full text-left bg-indigo-700/40 px-4 py-3 rounded-lg hover:bg-indigo-700/60 transition"
              >
                <span className="text-xl font-semibold text-indigo-200">
                  {status} 🎥
                </span>
                <span className="text-sm text-gray-300">
                  {movies.length} movie{movies.length !== 1 ? "s" : ""}
                </span>
              </button>

              {!collapsed[status] && (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4"
                      : "flex flex-col space-y-3 mt-4"
                  }
                >
                  {movies.map((movie) => (
                    <div
                      key={movie.id}
                      className="relative bg-white/10 rounded-lg p-3 shadow-lg flex flex-col sm:flex-row sm:items-center hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                            : "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={movie.title}
                        className={`rounded-md ${
                          viewMode === "grid"
                            ? "w-full h-48 object-cover"
                            : "w-20 h-28 mr-3 object-cover"
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base mb-2">
                          {movie.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                        title="Remove Movie"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
