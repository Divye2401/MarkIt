"use client";
import Image from "next/image";
import BookmarkWelcome from "./BookmarkWelcome";

export default function BookmarkNavbar({ user, bookmarks, onLogout }) {
  return (
    <nav className="flex items-center justify-between bg-white px-12 py-6 shadow-sm relative">
      {/* Left: Logo */}
      <div className="text-lg font-semibold">📑 Markit</div>
      {/* Center: Welcome message with extra padding */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-8">
        <BookmarkWelcome user={user} bookmarks={bookmarks} />
      </div>
      {/* Right: User info and logout */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium hidden sm:block">
          {user.user_metadata?.full_name}
        </span>
        <Image
          src={user.user_metadata?.avatar_url}
          alt="Profile"
          className="w-10 h-10 rounded-full border"
          width={40}
          height={40}
        />
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
