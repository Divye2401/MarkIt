/* eslint-disable @next/next/no-img-element */
"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchBookmarkById,
  updateBookmark,
} from "../../../utils/Frontend/BookmarkHelpers";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../../../utils/Providers/AuthHelpers";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { getAccessToken } from "../../../utils/Providers/AuthHelpers";
import React from "react";
import SuggestedReads from "./SuggestedReads";
import AddUserModal from "./AddUserModal";
import DeleteModal from "./DeleteModal";

export default function BookmarkDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const {
    data: bookmark,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["onebookmark", id],
    queryFn: () => fetchBookmarkById(id),
    enabled: !!id,
  });

  // Add state for editable notes
  const [notes, setNotes] = useState(bookmark?.notes || "");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [suggestedResults, setSuggestedResults] = useState([]);
  const [addUserOpen, setAddUserOpen] = useState(false);

  // Editable fields state
  const [editTitle, setEditTitle] = useState(bookmark?.title || "");
  const [editTags, setEditTags] = useState(bookmark?.tags?.join(", ") || "");
  const [editSummary, seteditSummary] = useState(bookmark?.summary || "");
  const [editBiggerSummary, setEditBiggerSummary] = useState(
    bookmark?.bigger_summary || ""
  );

  useEffect(() => {
    setEditTitle(bookmark?.title || "");
    setEditTags(bookmark?.tags?.join(", ") || "");
    seteditSummary(bookmark?.summary || "");
    setEditBiggerSummary(bookmark?.bigger_summary || "");
    setNotes(bookmark?.notes || "");
  }, [bookmark]);

  // Fetch suggested results from semantic search API using bookmark.embedding
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!bookmark?.tags || bookmark.tags.length === 0) return;
      try {
        const randomCount = Math.floor(Math.random() * 4) + 1; // Random number 1-4
        const query = bookmark.tags.slice(0, randomCount).join(" ");
        const accessToken = await getAccessToken();
        const res = await fetch("/api/semantic-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query, semantic: false }),
        });
        const data = await res.json();

        // Only set suggested results if present
        if (data && data.suggestedLinks) {
          setSuggestedResults(data.suggestedLinks);
        } else {
          setSuggestedResults([]);
        }
      } catch (err) {
        setSuggestedResults([]);
      }
    };
    fetchSuggestions();
  }, [bookmark?.tags]);

  // Save handler for editing bookmark
  const handleEditBookmark = async () => {
    setEditLoading(true);
    try {
      const userName = user?.user_metadata?.name || user?.email || "Unknown";
      // Remove any existing "username:" prefix (case-insensitive, with or without spaces)
      let cleanedNotes = notes
        .replace(new RegExp(`^${userName}:\\s*`, "i"), "")
        .trim();
      const formattedNote = `${userName}: ${cleanedNotes}`;
      const updated = await updateBookmark({
        id: bookmark.id,
        title: editTitle,
        summary: editSummary,
        bigger_summary: editBiggerSummary,
        reading_time: bookmark.reading_time,
        url: bookmark.url,
        tags: editTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: formattedNote,
      });
      if (updated.success) {
        toast.success("Bookmark updated!");
        queryClient.invalidateQueries({
          queryKey: ["onebookmark", bookmark.id],
        });
      } else {
        toast.error(updated.error || "Failed to update bookmark.");
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handler for copying link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied! Ready to share.");
  };

  // Delete bookmark handler (adapted from BookmarkCard.js)
  const handleDeleteBookmark = async () => {
    const toastId = toast.loading("Deleting bookmark...");
    try {
      const deleted = await deleteBookmark(bookmark.id);
      setDeleteOpen(false);
      if (deleted.success) {
        toast.success("Bookmark deleted!", { id: toastId });
        router.push("/bookmark");
      } else {
        toast.error(deleted.error || "Failed to delete bookmark.", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("Failed to delete bookmark.", { id: toastId });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error.message}</div>;
  if (!bookmark)
    return <div className="p-8 text-center">Bookmark not found.</div>;

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
      {/* Animated card */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full p-6 bg-zinc-900 text-zinc-100 rounded-lg shadow-lg mt-8"
      >
        <div className="mb-4 border-b border-zinc-700 pb-2">
          {/* Editable title input with original styling */}
          <input
            className="text-2xl font-bold mb-1 bg-transparent border-none outline-none w-full text-zinc-100"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Bookmark Title"
          />
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm hover:underline"
          >
            {bookmark.url}
          </a>
        </div>
        <div className="flex items-center text-xs text-zinc-400 mb-2 gap-4">
          <span>
            Saved on:{" "}
            {bookmark.created_at
              ? new Date(bookmark.created_at).toLocaleDateString()
              : "-"}
          </span>
          <span>|</span>
          <span>
            Estimated Read Time:{" "}
            {bookmark.reading_time ? `${bookmark.reading_time} min` : "-"}
          </span>
        </div>
        <div className="mb-2">
          <span className="text-sm font-medium text-zinc-300">Tags:</span>
          {/* Modernized tags input with dark hover */}
          <input
            className="mt-2 px-2 py-1 w-full bg-zinc-800 rounded-md text-xs text-blue-300 border-none outline-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400 hover:bg-zinc-900"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Comma separated tags"
          />
        </div>
        <div className="mt-4 mb-2">
          <div className="text-sm font-semibold text-zinc-300 mb-1">
            Description
          </div>
          {/* Modernized description textarea with dark hover */}
          <textarea
            className="bg-zinc-800 p-3 rounded-md text-zinc-200 text-sm w-full min-h-[60px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm placeholder:text-zinc-400 hover:bg-zinc-900"
            value={editSummary}
            onChange={(e) => seteditSummary(e.target.value)}
            placeholder="Short summary/description"
          />
        </div>
        <div className="mt-4 mb-2">
          <div className="text-sm font-semibold text-zinc-300 mb-1">
            Detailed Summary
          </div>
          {/* Modernized detailed summary textarea with dark hover */}
          <textarea
            className="bg-zinc-800 p-3 rounded-lg text-zinc-200 text-sm w-full min-h-[200px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md placeholder:text-zinc-400 whitespace-pre-line hover:bg-zinc-900"
            value={editBiggerSummary}
            onChange={(e) => setEditBiggerSummary(e.target.value)}
            placeholder="Detailed multi-paragraph summary"
          />
        </div>
        <div className="mt-4 mb-2">
          <div className="text-sm font-semibold text-zinc-300 mb-1">
            Your Notes
          </div>
          {/* Notes textarea is now editable */}
          <textarea
            className="bg-zinc-800 p-3 rounded-md text-zinc-200 text-sm w-full min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm placeholder:text-zinc-400 hover:bg-zinc-900"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes here..."
          />
        </div>
        <div className="mt-4 mb-2">
          <div className="text-sm font-semibold text-zinc-300 mb-1">
            Folder:
          </div>
          {/* Modernized folder display with dark hover */}
          <div className="bg-zinc-800 p-2 rounded text-zinc-200 text-sm hover:bg-zinc-900 transition-all">
            {bookmark.folder_name || "(No Folder)"}
          </div>
          <Link
            href="/folder"
            target="_blank"
            className="text-blue-400 text-xs hover:underline ml-2"
          >
            View All in Folder
          </Link>
        </div>
        {/* Suggested Reads Section */}
        <SuggestedReads suggestedResults={suggestedResults} />
        <div className="mt-6 flex gap-4 text-xs text-zinc-400 border-t border-zinc-700 pt-4">
          <button
            className="hover:underline text-blue-400"
            type="button"
            onClick={() => setAddUserOpen(true)}
          >
            Add User
          </button>
          <button
            className="hover:underline"
            type="button"
            onClick={handleCopyLink}
          >
            Copy Link
          </button>
          <button
            className="hover:underline text-red-400"
            type="button"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </button>
        </div>
        {/* Add User Modal */}
        <AddUserModal
          open={addUserOpen}
          onClose={() => setAddUserOpen(false)}
          id={id}
        />
        {/* Delete Confirmation Dialog */}
        <DeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onDelete={handleDeleteBookmark}
        />
        <div className="flex justify-end mt-4">
          {/* Modernized Save button */}
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-500 focus:ring-2 focus:ring-blue-500 transition-all font-semibold disabled:opacity-60"
            onClick={handleEditBookmark}
            disabled={editLoading}
            type="button"
          >
            {editLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
