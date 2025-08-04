"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPrompt() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-10 flex flex-col items-center"
      >
        <svg
          className="w-20 h-20 mb-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h11.25m0 0l-3-3m3 3l-3 3"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Login Required
        </h2>
        <p className="text-gray-600 mb-6 text-center max-w-xs">
          You need to be logged in to access your bookmarks. Please log in to
          continue.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
}
