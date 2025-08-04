"use client";
import { Plus } from "lucide-react";

export default function AddBookmarkButton({ onClick }) {
  return (
    <button
      className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50 text-3xl"
      onClick={onClick}
      aria-label="Add Bookmark"
    >
      <Plus size={36} />
    </button>
  );
}
