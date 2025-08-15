"use client";
import { Plus } from "lucide-react";

export default function AddBookmarkButton({ onClick }) {
  return (
    <button
      className="bg-button text-primary-foreground rounded-full w-14 h-9 flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all duration-300 hover:scale-110 active:scale-95 z-50"
      onClick={onClick}
      aria-label="Add Bookmark"
    >
      <Plus size={24} />
    </button>
  );
}
