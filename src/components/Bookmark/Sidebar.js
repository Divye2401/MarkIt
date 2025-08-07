import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders, createFolder } from "../../utils/Frontend/FolderHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

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
      className={`min-h-screen bg-white border-r flex flex-col p-2 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex items-center justify-between mb-2 ${
          hovered ? "px-2" : "px-0"
        }`}
      >
        {hovered ? (
          <h2 className="text-lg font-bold">Folders</h2>
        ) : (
          <span className="text-lg font-bold">Folders</span>
        )}
        {hovered && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowNewFolderModal(true)}
            aria-label="Add Folder"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <button
              className={`w-full flex items-center gap-2 px-2 py-2 rounded transition font-medium ${
                !selectedFolderId
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => onSelectFolder(null)}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-700 font-bold">
                {hovered ? "★" : "★"}
              </span>
              {hovered && <span>All Bookmarks</span>}
            </button>
          </li>
          {isLoading ? (
            <li className="text-gray-400 px-2 py-2">Loading...</li>
          ) : (
            folders.map((folder) => (
              <li key={folder.id}>
                <button
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded transition font-medium ${
                    selectedFolderId === folder.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold">
                    {folder.name.slice(0, 2).toUpperCase()}
                  </span>
                  {hovered && (
                    <>
                      <span className="truncate">{folder.name}</span>
                      {folder.count !== undefined && (
                        <span className="ml-auto text-xs text-gray-400">
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
        <DialogContent className="bg-gray-100 text-gray-900 border border-yellow-200">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <textarea
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
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
