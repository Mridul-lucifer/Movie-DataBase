import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Eye } from "lucide-react";

export default function MovieReels() {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [user, setUser] = useState(null);
  const startY = useRef(null);
  const threshold = 80; // min distance for swipe gesture

  const API_KEY = import.meta.env.VITE_TMDB_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Check user auth
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      window.location.href = "/login";
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  // 🎯 Fetch personalized recommendations based on user's watched movies
useEffect(() => {
  const fetchRecommendedMovies = async () => {
    if (!user?.id) return;

    try {
      // 1️⃣ Fetch user's movies from your backend
      const userMoviesRes = await fetch(`${API_URL}/api/movies/${user.id}`);
      const userMovies = await userMoviesRes.json();

      // 2️⃣ Filter for watched or in-progress movies
      const watched = userMovies.filter(
        (m) => m.status === "Watched" || m.status === "In Progress"
      );

      if (watched.length === 0) {
        console.warn("No watched movies found. Showing popular as fallback.");
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await res.json();
        setMovies(data.results || []);
        return;
      }

      // 3️⃣ Fetch similar movies for each watched movie
      const similarFetches = watched.slice(0, 5).map((movie) =>
        fetch(
          `https://api.themoviedb.org/3/movie/${movie.tmdb_id}/similar?api_key=${API_KEY}&language=en-US`
        ).then((res) => res.json())
      );

      const similarResults = await Promise.all(similarFetches);

      // 4️⃣ Merge and deduplicate results
      const allSimilarMovies = similarResults.flatMap((r) => r.results || []);
      const uniqueMovies = Array.from(
        new Map(allSimilarMovies.map((m) => [m.id, m])).values()
      );

      // 5️⃣ Set recommendations
      setMovies(uniqueMovies);
    } catch (err) {
      console.error("Error loading personalized movies:", err);
    }
  };

  fetchRecommendedMovies();
}, [user]);


  // ➕ Add movie to DB
  const addMovie = async (movie, status) => {
    if (!user) return alert("Please log in first!");

    try {
      const res = await fetch(`${API_URL}/api/movies/add`, {
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

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Added "${movie.title}" to ${status}!`);
      } else {
        alert(data.error || "Failed to add movie.");
      }
    } catch (err) {
      console.error("Error adding movie:", err);
    }
  };

  // 🧭 Handle Swipe Gestures
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!startY.current) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY.current - endY;

    if (diff > threshold && index < movies.length - 1) {
      // swipe up → next
      setIndex((prev) => prev + 1);
    } else if (diff < -threshold && index > 0) {
      // swipe down → previous
      setIndex((prev) => prev - 1);
    }

    startY.current = null;
  };

  if (movies.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading movie reels...
      </div>
    );
  }

  const movie = movies[index];

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🎞️ Movie Reel Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
        >
          {/* Poster */}
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"
            }
            alt={movie.title}
            className="object-cover w-full h-full absolute top-0 left-0 opacity-40"
          />

          {/* Overlay Content */}
          <div className="z-10 text-center px-6">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-lg">
              {movie.title}
            </h1>
            <p className="text-gray-300 text-sm max-w-md mx-auto mb-6 line-clamp-3">
              {movie.overview}
            </p>

            {/* 🎬 Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => addMovie(movie, "Watched")}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition"
              >
                <CheckCircle size={24} />
              </button>
              <button
                onClick={() => addMovie(movie, "In Progress")}
                className="p-4 rounded-full bg-yellow-500 hover:bg-yellow-600 transition"
              >
                <Clock size={24} />
              </button>
              <button
                onClick={() => addMovie(movie, "Not Yet")}
                className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 transition"
              >
                <Eye size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 🔽 UI Hints */}
      <div className="absolute bottom-5 text-sm text-gray-400">
        Swipe up/down to browse movies
      </div>
    </div>
  );
}
