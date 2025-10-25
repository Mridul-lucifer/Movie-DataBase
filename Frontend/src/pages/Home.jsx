import { useState, useEffect } from "react";
import { CheckCircle, Clock, Eye, Pencil, XCircle } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_TMDB_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  // 🧑‍💻 Simulated user (replace with logged-in user data)
  const user = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  // 🔁 Fetch all movies for this user
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

  // 🔍 Search movies via TMDB
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

  // ➕ Add movie to user's list
  const addMovie = async (movie, status) => {
    try {
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
    } catch (err) {
      console.error("Error adding movie:", err);
    }
  };

  // Delete movie
  const deleteMovie = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this movie?");
    if (!confirmDelete) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/movies/delete/${id}`, {
      method: "DELETE",
    });
    reloadMovies();
  };



  // ✏️ Update movie status
  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/api/movies/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      reloadMovies();
    } catch (err) {
      console.error("Error updating movie:", err);
    }
  };

  // 🎯 Filter movies by status
  const getMoviesByStatus = (status) =>
    movieList.filter((m) => m.status === status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-300">
        🎬 My Movie Tracker
      </h1>

      {/* Search Form */}
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
              ❌ Clear Recommendations
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {results.map((movie) => (
              <div
                key={movie.id}
                className="bg-white/10 rounded-lg p-3 shadow-lg hover:scale-105 transition-transform"
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.title}
                  className="rounded-md mb-3 w-full h-48 sm:h-64 md:h-72 object-cover shadow-md"
                />
                <h3 className="font-semibold text-sm text-center">
                  {movie.title}
                </h3>
                <div className="flex justify-center mt-3 space-x-2">
                  <button
                    onClick={() => addMovie(movie, "Watched")}
                    className="p-2 rounded-full bg-green-500 hover:bg-green-600"
                    title="Mark as Watched"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => addMovie(movie, "In Progress")}
                    className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600"
                    title="Mark as In Progress"
                  >
                    <Clock size={18} />
                  </button>
                  <button
                    onClick={() => addMovie(movie, "Not Yet")}
                    className="p-2 rounded-full bg-gray-500 hover:bg-gray-600"
                    title="Mark as Not Yet Watched"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movie Lists */}
      <div className="max-w-6xl mx-auto">
        {["Watched", "In Progress", "Not Yet"].map((status) => (
          <div key={status} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">
              {status} 🎥
            </h2>
            {getMoviesByStatus(status).length === 0 ? (
              <p className="text-gray-400">No movies here yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {getMoviesByStatus(status).map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-white/10 rounded-lg p-3 shadow-lg hover:scale-105 transition-transform relative"
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={movie.title}
                      className="rounded-md mb-3 w-full h-48 sm:h-64 md:h-72 object-cover shadow-md"
                    />
                    <h3 className="font-semibold text-sm text-center mb-2">
                      {movie.title}
                    </h3>
                    {status !== "Watched" && (
                      <button
                        onClick={() => updateStatus(movie.id, "Watched")}
                        className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2"
                        title="Mark as Watched"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMovie(movie.id)}
                      className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                      title="Remove Movie"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
