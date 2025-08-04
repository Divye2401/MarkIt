"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import bookmarkData from "../animations/bookmark.json";
import catData from "../animations/cat.json";

export default function LoginPage() {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 w-full font-[var(--font-poppins)]">
      {/* Cat animation in top right */}
      <div className="absolute top-0 right-10 w-24 h-24 z-50 pointer-events-none transform scale-400 origin-top-right">
        <Lottie animationData={catData} loop />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Lottie
          animationData={bookmarkData}
          loop
          className="w-24 h-24 md:w-32 md:h-32"
        />
        <h1 className="text-5xl font-bold text-gray-800 tracking-tight">
          Welcome to Markit!
        </h1>
      </div>

      <div
        className="font-poppins
       text-center mt-2 text-lg md:text-xl text-blue-500 italic drop-shadow-sm mb-6"
      >
        Your bookmarks, organized and supercharged by AI.
      </div>

      {/* --- Google Login Button --- */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Login with Google
      </motion.button>

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 px-4 py-2 rounded w-full max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
