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
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 ">
      {/* Top: AI Summary + Key Stats */}
      <section className="bg-white rounded shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">
            {folderLoading ? "Loading..." : folder?.name || "Folder"}
          </h2>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {folderLoading
                ? "--"
                : folder?.description
                ? folder.description
                : "--"}
            </div>
            <div className="text-xs text-gray-500">Description</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {folderLoading ? "--" : folder?.doc_count ?? "--"}
            </div>
            <div className="text-xs text-gray-500">Total Bookmarks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{`${avgReadingTime} mins`}</div>
            <div className="text-xs text-gray-500">Avg Reading Time</div>
          </div>
        </div>
      </section>

      {/* Middle: Charts Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Pie/Bar Chart */}
        <div className="bg-white rounded shadow p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderPieChart bookmarks={bookmarks} />
        </div>
        {/* Center: Bar Chart */}
        <div className="bg-white rounded shadow p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderBarChart bookmarks={bookmarks} />
        </div>
        {/* Right: Timeline/Activity Heatmap */}
        <div className="bg-white rounded shadow p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderTimeline bookmarks={bookmarks} />
        </div>
      </section>

      {/* Bottom: Bookmark Grid/List */}
      <section className="bg-white rounded shadow p-6 mt-4">
        <h3 className="font-semibold mb-4">Bookmarks in this Folder</h3>
        {bookmarksLoading ? (
          <div className="text-gray-400">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-gray-400">No bookmarks in this folder.</div>
        ) : (
          <ul className="divide-y">
            {bookmarks.map((b) => (
              <li
                key={b.id}
                className="py-2 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 transition cursor-pointer"
              >
                <Link
                  href={`/bookmark/${b.id}`}
                  className="flex-1 flex justify-between items-center w-full gap-2 py-1"
                >
                  <span className="font-medium">{b.title || b.url}</span>
                  <span className="text-xs text-gray-500">
                    {b.reading_time ? `${b.reading_time} min` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Share Button */}
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
    </div>
  );
}
