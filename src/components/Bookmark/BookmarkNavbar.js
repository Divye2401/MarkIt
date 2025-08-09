"use client";
import Image from "next/image";
import BookmarkWelcome from "./BookmarkWelcome";
import ThemeToggle from "../ui/theme-toggle";

export default function BookmarkNavbar({ user, bookmarks, onLogout }) {
  return (
    <nav className="bg-background px-4 sm:px-12 py-0 shadow-sm border-b border-border">
      {/* Large screens: Logo, centered welcome, right side actions */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Left: Logo */}
        <div className="text-lg font-semibold">📑 Markit</div>

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
            className="w-10 h-10 rounded-full border"
            width={40}
            height={40}
          />
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg hover:scale-105 bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Small/Medium screens: Welcome + Logout only */}
      <div className="md:hidden flex items-center justify-around">
        <BookmarkWelcome user={user} bookmarks={bookmarks} />
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
