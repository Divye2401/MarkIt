import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders, createFolder } from "../../utils/Frontend/FolderHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Sidebar for displaying folder shortcuts and creating new folders.
export default function Sidebar({
  selectedFolderId = null,
  onSelectFolder = () => {},
}) {
  const [hovered, setHovered] = useState(false);
  const sidebarWidth = hovered ? "w-64" : "w-20";
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const router = useRouter();

  const {
    data: folders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["folders-sidebar"],
    queryFn: fetchFolders,
  });

  async function handleCreateFolder() {
    try {
      await createFolder({
        name: newFolderName,
        description: newFolderDescription,
      });
      toast.success("Folder created!");
      setShowNewFolderModal(false);
      setNewFolderName("");
      setNewFolderDescription("");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create folder.");
    }
  }

  return (
    <aside
      className={`min-h-screen bg-background border-r border-border flex flex-col p-2 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex items-center justify-between mb-2 ${
          hovered ? "px-2" : "px-0"
        }`}
      >
        {hovered ? (
          <h2 className="text-heading-sm text-foreground">Folders</h2>
        ) : (
          <span className="text-heading-sm text-foreground">Folders</span>
        )}
        {hovered && (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/folder")}
              aria-label="Go to Folders"
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNewFolderModal(true)}
              aria-label="Add Folder"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <button
              className={`w-full flex items-center gap-2 px-2 py-2 rounded transition font-medium ${
                !selectedFolderId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-elevated text-foreground-secondary"
              }`}
              onClick={() => onSelectFolder(null)}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                {hovered ? "★" : "★"}
              </span>
              {hovered && <span className="text-body">All Bookmarks</span>}
            </button>
          </li>
          {isLoading ? (
            <li className="text-body-sm text-foreground-muted px-2 py-2">
              Loading...
            </li>
          ) : (
            folders.map((folder) => (
              <li key={folder.id}>
                <button
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded transition font-medium ${
                    selectedFolderId === folder.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-surface-elevated text-foreground-secondary"
                  }`}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated text-foreground font-bold text-caption">
                    {folder.name.slice(0, 2).toUpperCase()}
                  </span>
                  {hovered && (
                    <>
                      <span className="truncate text-body">{folder.name}</span>
                      {folder.count !== undefined && (
                        <span className="ml-auto text-caption text-foreground-muted">
                          {folder.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </nav>
      {/* New Folder Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent className="bg-surface-elevated text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-heading-md">
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="px-3 py-2 rounded border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <textarea
            className="px-3 py-2 rounded border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
            placeholder="Description (optional)"
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="default"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewFolderModal(false);
                setNewFolderName("");
                setNewFolderDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
