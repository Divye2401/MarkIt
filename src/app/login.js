"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Lottie from "lottie-react";
import bookmarkData from "../animations/bookmark.json";
import catData from "../animations/cat.json";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_URL}/bookmark`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-center px-4 w-full">
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
        <h1 className="text-heading-xl text-foreground">Welcome to Markit!</h1>
      </div>

      <div className="text-body-lg text-center mt-2 text-primary italic drop-shadow-sm mb-6">
        Your bookmarks, organized and supercharged by AI.
      </div>

      {/* --- Google Login Button --- */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary-hover transition-colors"
      >
        Login with Google
      </motion.button>

      {error && (
        <div className="mt-4 text-error bg-error/10 border border-error/20 px-4 py-2 rounded w-full max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
