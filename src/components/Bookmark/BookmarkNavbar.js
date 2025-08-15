"use client";
import Image from "next/image";
import BookmarkWelcome from "./BookmarkWelcome";
import ThemeToggle from "../ui/theme-toggle";

export default function BookmarkNavbar({ user, bookmarks, onLogout }) {
  return (
    <nav className="bg-surface/80  mx-4 mt-4 mb-6 px-6 py-4 shadow-md border border-border/30 rounded-2xl">
      {/* Large screens: Logo, centered welcome, right side actions */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Left: Logo */}
        <div className="text-xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl">
          📑 Markit
        </div>

        {/* Center: Welcome message */}
        <div className=" px-8">
          <BookmarkWelcome user={user} bookmarks={bookmarks} />
        </div>

        {/* Right: Theme toggle, User info and logout */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Image
            src={user.user_metadata?.avatar_url}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-border shadow-md"
            width={40}
            height={40}
          />
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl hover:scale-105 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Small/Medium screens: Welcome + Logout only */}
      <div className="md:hidden flex items-center justify-between">
        <BookmarkWelcome user={user} bookmarks={bookmarks} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
