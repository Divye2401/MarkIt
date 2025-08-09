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
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 bg-background min-h-screen">
      {/* Top: AI Summary + Key Stats */}
      <section className="bg-surface rounded-lg shadow border border-border p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-heading-lg text-foreground mb-2">
            {folderLoading ? "Loading..." : folder?.name || "Folder"}
          </h2>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-heading-md text-foreground">
              {folderLoading
                ? "--"
                : folder?.description
                ? folder.description
                : "--"}
            </div>
            <div className="text-caption text-foreground-muted">
              Description
            </div>
          </div>
          <div className="text-center">
            <div className="text-heading-md text-foreground">
              {folderLoading ? "--" : folder?.doc_count ?? "--"}
            </div>
            <div className="text-caption text-foreground-muted">
              Total Bookmarks
            </div>
          </div>
          <div className="text-center">
            <div className="text-heading-md text-foreground">{`${avgReadingTime} mins`}</div>
            <div className="text-caption text-foreground-muted">
              Avg Reading Time
            </div>
          </div>
        </div>
      </section>

      {/* Middle: Charts Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Pie/Bar Chart */}
        <div className="bg-surface rounded-lg shadow border border-border p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderPieChart bookmarks={bookmarks} />
        </div>
        {/* Center: Bar Chart */}
        <div className="bg-surface rounded-lg shadow border border-border p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderBarChart bookmarks={bookmarks} />
        </div>
        {/* Right: Timeline/Activity Heatmap */}
        <div className="bg-surface rounded-lg shadow border border-border p-6 min-h-[250px] flex flex-col items-center justify-center">
          <FolderTimeline bookmarks={bookmarks} />
        </div>
      </section>

      {/* Bottom: Bookmark Grid/List */}
      <section className="bg-surface rounded-lg shadow border border-border p-6 mt-4">
        <h3 className="text-heading-md text-foreground mb-4">
          Bookmarks in this Folder
        </h3>
        {bookmarksLoading ? (
          <div className="text-body text-foreground-secondary">
            Loading bookmarks...
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-body text-foreground-muted">
            No bookmarks in this folder.
          </div>
        ) : (
          <ul className="divide-y">
            {bookmarks.map((b) => (
              <li
                key={b.id}
                className="py-2 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-surface-elevated transition cursor-pointer rounded"
              >
                <Link
                  href={`/bookmark/${b.id}`}
                  className="flex-1 flex justify-between items-center w-full gap-2 py-1"
                >
                  <span className="text-body text-foreground font-medium">
                    {b.title || b.url}
                  </span>
                  <span className="text-caption text-foreground-muted">
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
            className="px-4 py-2 bg-success text-primary-foreground rounded hover:bg-success/90 transition"
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
