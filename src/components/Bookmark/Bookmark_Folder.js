import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  fetchFolders,
  addBookmarkToFolder,
  createFolder,
  deleteFolder,
  removeBookmarkFromFolder,
} from "../../utils/Frontend/FolderHelpers";
import { toast } from "sonner";

// Bookmark_Folder: Modal for selecting a folder for a bookmark
export default function Bookmark_Folder({
  open,
  bookmarkId, // always required
  onClose = () => {},
  onOpenChange,
}) {
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");

  // Fetch all folders for the user
  const {
    data: folders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["folders-all"],
    queryFn: fetchFolders,
    enabled: open,
  });

  async function handleAddToFolder(folderId) {
    try {
      await addBookmarkToFolder(folderId, bookmarkId);
      toast.success("Bookmark added to folder!");
      refetch();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add bookmark to folder.");
    }
  }

  // Handler for creating a new folder and adding the bookmark to it
  async function handleCreateFolder() {
    try {
      const folder = await createFolder({
        name: newFolderName,
        description: newFolderDescription,
      });

      toast.success("Folder created!");
      setShowNewFolderInput(false);
      setNewFolderName("");
      setNewFolderDescription("");
      refetch();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create folder.");
    }
  }
  async function handleDeleteFolder(folderId) {
    try {
      await deleteFolder(folderId);
      toast.success("Folder deleted!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete folder.");
    }
  }

  async function handleRemoveFromFolder(folderId) {
    try {
      await removeBookmarkFromFolder(folderId, bookmarkId);
      toast.success("Bookmark removed from folder!");
      refetch();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to remove bookmark from folder.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-surface text-gray-900 dark:text-white border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Select Folder</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          {isLoading && (
            <div className="text-gray-500 text-sm">Loading folders...</div>
          )}
          {isError && (
            <div className="text-red-500 text-sm">
              {error?.message || "Failed to load folders."}
            </div>
          )}
          {!isLoading && !isError && folders.length === 0 && (
            <div className="text-gray-500 text-sm">No folders found.</div>
          )}
          {folders.map((folder) => {
            const hasBookmark = folder.bookmark_ids.includes(bookmarkId);
            return (
              <div key={folder.id} className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  className="justify-start flex-shrink-0"
                  style={{ width: "60%" }}
                >
                  {folder.name}
                  {folder.doc_count !== undefined && (
                    <span className="ml-2 text-xs text-gray-400">
                      {folder.doc_count} bookmarks
                    </span>
                  )}
                </Button>
                {/* Show + only if bookmark is not in this folder */}
                {!hasBookmark && (
                  <Button
                    variant="outline"
                    size="icon"
                    title="Add to Folder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFolder(folder.id);
                    }}
                  >
                    +
                  </Button>
                )}
                {/* Show - only if bookmark is in this folder */}
                {hasBookmark && (
                  <Button
                    variant="outline"
                    size="icon"
                    title="Remove from Folder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFolder(folder.id);
                    }}
                  >
                    -
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  title="Delete Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                >
                  &#x2715;
                </Button>
              </div>
            );
          })}
        </div>
        {/* Black Add Folder Button at the end */}
        {!showNewFolderInput && (
          <div className="flex justify-center mt-2 w-auto">
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-900"
              title="Add Folder"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewFolderInput(true);
              }}
            >
              Add a new folder
            </Button>
          </div>
        )}
        {/* Create New Folder Section */}
        {showNewFolderInput && (
          <div className="mt-4 flex flex-col gap-2">
            <input
              type="text"
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <textarea
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Description (optional)"
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFolder();
                }}
                disabled={!newFolderName.trim()}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewFolderInput(false);
                  setNewFolderName("");
                  setNewFolderDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
