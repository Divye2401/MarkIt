import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Star, StarOff, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  updateBookmark,
  deleteBookmark,
  uploadBookmarkImage,
} from "../../utils/Frontend/BookmarkHelpers";
import { fetchUser } from "../../utils/Providers/AuthHelpers";
import Image from "next/image";
import { useRouter } from "next/navigation";

// BookmarkCard displays a single bookmark with interactive features (edit, delete, favorite, thumbnail upload)

export default function BookmarkCard({ bookmark, refresh }) {
  // --- State for UI interactivity ---
  const [hovered, setHovered] = useState(false); // For slide-up modal
  const [modalHeight, setModalHeight] = useState(0); // For dynamic modal height
  const modalRef = useRef(null);
  const [editOpen, setEditOpen] = useState(false); // Edit modal open/close
  const [editTitle, setEditTitle] = useState(bookmark.title || "");
  const [editDescription, setEditDescription] = useState(
    bookmark.summary || ""
  );
  const [editReadingTime, setEditReadingTime] = useState(
    bookmark.reading_time || ""
  );
  const [editUrl, setEditUrl] = useState(bookmark.url || "");
  const [editTags, setEditTags] = useState(bookmark.tags?.join(", ") || "");
  const [editImageFile, setEditImageFile] = useState(null); // For new image upload
  const [editImageUploading, setEditImageUploading] = useState(false); // Upload state
  const [deleteOpen, setDeleteOpen] = useState(false); // Delete modal open/close
  const [isFavorite, setIsFavorite] = useState(bookmark.is_favorite); // Favorite toggle

  const router = useRouter();

  // --- Modal height calculation for smooth animation ---
  useEffect(() => {
    if (hovered && modalRef.current) {
      setModalHeight(modalRef.current.scrollHeight);
    }
  }, [hovered, bookmark]);

  // --- Layout constants ---
  const headerHeight = 72; // px, adjust if you change header size

  // --- Edit bookmark handler (handles image upload if needed) ---
  const handleEditBookmark = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating bookmark...");
    try {
      let imageUrl = bookmark.thumbnail_url; // Keep existing thumbnail if no new file
      if (editImageFile) {
        setEditImageUploading(true);
        const user = await fetchUser();
        imageUrl = await uploadBookmarkImage(editImageFile, user.id); // Upload to Supabase Storage
        setEditImageUploading(false);
      }
      // Update bookmark with new data (including new thumbnail if uploaded)
      const updated = await updateBookmark({
        id: bookmark.id,
        title: editTitle,
        description: editDescription,
        reading_time: editReadingTime,
        url: editUrl,
        tags: editTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        thumbnail_url: imageUrl,
      });
      setEditOpen(false);
      refresh();
      if (updated.success) {
        toast.success("Bookmark updated!", { id: toastId });
      } else {
        toast.error(updated.error || "Failed to update bookmark.", {
          id: toastId,
        });
      }
    } catch (err) {
      setEditImageUploading(false);
      toast.error("Failed to update bookmark.", { id: toastId });
    }
  };

  // --- Delete bookmark handler ---
  const handleDeleteBookmark = async () => {
    const toastId = toast.loading("Deleting bookmark...");
    try {
      const deleted = await deleteBookmark(bookmark.id);
      setDeleteOpen(false);
      refresh();
      if (deleted.success) {
        toast.success("Bookmark deleted!", { id: toastId });
      } else {
        toast.error(deleted.error || "Failed to delete bookmark.", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("Failed to delete bookmark.", { id: toastId });
    }
  };

  // --- Toggle favorite status ---
  const handleToggleFavorite = async () => {
    try {
      const updated = await updateBookmark({
        id: bookmark.id,
        is_favorite: !isFavorite,
      });
      const newFavorite = updated.bookmark?.is_favorite ?? !isFavorite;
      setIsFavorite(newFavorite);
      toast.success(
        newFavorite ? "Added to favorites!" : "Removed from favorites!"
      );
      refresh();
    } catch (err) {
      toast.error("Failed to update favorite status.");
    }
  };

  // --- Render ---
  return (
    <Card
      className="relative min-h-[120px] border overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/bookmark/${bookmark.id}`)}
      style={{
        minHeight: hovered ? headerHeight + modalHeight : headerHeight,
        background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
        transition: "all 0.3s",
        cursor: "pointer",
      }}
    >
      {/* Header: avatar, title, and action buttons */}
      <CardHeader className="flex flex-row items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Thumbnail avatar (if present) */}
          {bookmark.thumbnail_url && (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 -mt-1">
              {" "}
              {/* -mt-1 nudges image up */}
              <Image
                src={bookmark.thumbnail_url}
                alt={bookmark.title || "Bookmark thumbnail"}
                width={40}
                height={40}
                className="object-cover w-10 h-10"
              />
            </div>
          )}
          {/* Title (truncated if too long) */}
          <CardTitle
            asChild
            className="truncate text-blue-700 pb-1 flex-1 min-w-0 flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {bookmark.title || bookmark.url}
              {bookmark.shared_with.length > 0 && (
                <button
                  type="button"
                  title="Shared with others"
                  className="ml-1 inline-flex items-center  text-blue-400 hover:text-blue-600 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(
                      bookmark.shared_with.length === 1
                        ? `Shared with 1 user: ${bookmark.shared_with.join(
                            ", "
                          )}`
                        : `Shared with ${
                            bookmark.shared_with.length
                          } users: ${bookmark.shared_with.join(", ")}`
                    );
                  }}
                  tabIndex={0}
                >
                  <Users size={16} />
                </button>
              )}
            </div>
          </CardTitle>
        </div>
        {/* Action buttons: favorite, edit, delete */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            className={`p-2 rounded transition ml-2 ${
              isFavorite ? "bg-yellow-100" : "hover:bg-gray-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            aria-label={isFavorite ? "Unfavorite" : "Favorite"}
            type="button"
          >
            {isFavorite ? (
              <Star className="text-yellow-500" size={18} />
            ) : (
              <StarOff size={18} />
            )}
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 transition ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
            aria-label="Edit Bookmark"
            style={{ flexShrink: 0 }}
          >
            <Pencil size={18} />
          </button>
          <button
            className="p-2 rounded hover:bg-red-100 transition ml-1"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
            aria-label="Delete Bookmark"
            style={{ flexShrink: 0 }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </CardHeader>

      {/* Slide-up modal: shows summary/tags/reading time on hover */}
      <div
        ref={modalRef}
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          background: "rgba(255,255,255,0.98)",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
          opacity: hovered ? 0.95 : 0,
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "all 0.3s",
          zIndex: 10,
        }}
      >
        <CardContent className="pt-2 pb-4 pointer-events-auto">
          <div className="text-gray-700 text-sm mb-2">{bookmark.summary}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {bookmark.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            {bookmark.reading_time ? `⏱️ ${bookmark.reading_time} min` : ""}
            {bookmark.duration ? ` | 🎵 ${bookmark.duration} min` : ""}
          </div>
        </CardContent>
      </div>

      {/* Edit Modal: allows editing all bookmark fields and uploading a new thumbnail */}
      {editOpen && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bookmark</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditBookmark(e);
              }}
              className="flex flex-col gap-4"
            >
              <Input
                name="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
              />
              <Textarea
                name="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <Input
                name="readingTime"
                value={editReadingTime}
                onChange={(e) => setEditReadingTime(e.target.value)}
                placeholder="Reading Time"
              />
              <Input
                name="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="URL"
              />
              {/* Image upload input for thumbnail */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setEditImageFile(e.target.files[0]);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={editImageUploading}
                />
                {editImageUploading && (
                  <span className="text-xs text-blue-500">Uploading...</span>
                )}
              </div>
              <Input
                name="tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editImageUploading}
                  onClick={(e) => e.stopPropagation()} // <-- Add this!
                >
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Bookmark</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete this bookmark?</div>
            <div className="flex gap-2 justify-end mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBookmark();
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
