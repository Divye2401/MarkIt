"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderById } from "../../../utils/Frontend/FolderHelpers";
import { fetchBookmarksByIds } from "../../../utils/Frontend/BookmarkHelpers";
import FolderPieChart from "./FolderPieChart";
import FolderTimeline from "./FolderTimeline";
import FolderBarChart from "./FolderBarChart";
import Link from "next/link";
import { useState } from "react";
import ShareModal from "./ShareModal";
import { motion } from "framer-motion";

export default function FolderDetailPage() {
  const { id } = useParams();
  const {
    data: folder,
    isLoading: folderLoading,
    isError: folderError,
    error: folderErrorObj,
  } = useQuery({
    queryKey: ["folder", id],
    queryFn: () => fetchFolderById(id),
    enabled: !!id,
  });

  const bookmarkIds = folder?.bookmark_ids || [];
  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    isError: bookmarksError,
    error: bookmarksErrorObj,
  } = useQuery({
    queryKey: ["bookmarks-in-folder", bookmarkIds],
    queryFn: () => fetchBookmarksByIds(bookmarkIds),
    enabled: !!bookmarkIds.length,
  });

  // Simpler (junior) average reading time calculation
  let avgReadingTime = "--";
  if (bookmarks.length > 0) {
    let total = 0;
    for (let i = 0; i < bookmarks.length; i++) {
      total += bookmarks[i].reading_time || 0;
    }
    avgReadingTime = (total / bookmarks.length).toFixed(1);
  }

  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
          alt="background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60" />
      </div>

      {/* Animated card container */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-5xl w-full p-6 bg-zinc-900 text-zinc-100 rounded-lg shadow-lg mt-8 space-y-6"
      >
        {/* Top: AI Summary + Key Stats */}
        <section className="mb-4 border-b border-zinc-700 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                {folderLoading ? "Loading..." : folder?.name || "Folder"}
              </h2>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-semibold text-zinc-100">
                  {folderLoading
                    ? "--"
                    : folder?.description
                    ? folder.description
                    : "--"}
                </div>
                <div className="text-xs text-zinc-400">Description</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-zinc-100">
                  {folderLoading ? "--" : folder?.doc_count ?? "--"}
                </div>
                <div className="text-xs text-zinc-400">Total Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-zinc-100">{`${avgReadingTime} mins`}</div>
                <div className="text-xs text-zinc-400">Avg Reading Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle: Charts Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Pie/Bar Chart */}
          <div className="bg-zinc-800 rounded-md p-4 min-h-[200px] flex flex-col items-center justify-center">
            <FolderPieChart bookmarks={bookmarks} />
          </div>
          {/* Center: Bar Chart */}
          <div className="bg-zinc-800 rounded-md p-4 min-h-[200px] flex flex-col items-center justify-center">
            <FolderBarChart bookmarks={bookmarks} />
          </div>
          {/* Right: Timeline/Activity Heatmap */}
          <div className="bg-zinc-800 rounded-md p-4 min-h-[200px] flex flex-col items-center justify-center">
            <FolderTimeline bookmarks={bookmarks} />
          </div>
        </section>

        {/* Bottom: Bookmark Grid/List */}
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-1">
            Bookmarks in this Folder
          </h3>
          {bookmarksLoading ? (
            <div className="text-sm text-zinc-300">Loading bookmarks...</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-sm text-zinc-400">
              No bookmarks in this folder.
            </div>
          ) : (
            <div className="bg-zinc-800 p-3 rounded-md text-zinc-200 text-sm">
              <ul className="space-y-2">
                {bookmarks.map((b) => (
                  <li
                    key={b.id}
                    className="py-2 px-3 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-zinc-900 transition cursor-pointer rounded"
                  >
                    <Link
                      href={`/bookmark/${b.id}`}
                      className="flex-1 flex justify-between items-center w-full gap-2 py-1"
                    >
                      <span className="text-sm text-zinc-200 font-medium">
                        {b.title || b.url}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {b.reading_time ? `${b.reading_time} min` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Button */}
          <div className="mt-4 flex justify-end">
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-500 focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
              onClick={() => setShareOpen(true)}
            >
              Share
            </button>
          </div>
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            id={id}
          />
        </section>
      </motion.div>
    </div>
  );
}
