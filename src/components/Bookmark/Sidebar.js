import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

// Sidebar for displaying folder shortcuts and creating new folders.
export default function Sidebar({
  folders = [],
  selectedFolderId = null,
  onSelectFolder = () => {},
  onCreateFolder = () => {},
}) {
  const [hovered, setHovered] = useState(false);
  const sidebarWidth = hovered ? "w-64" : "w-20";

  return (
    <aside
      className={`min-h-screen bg-white border-r flex flex-col p-2 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)} // fallback for width
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
            onClick={onCreateFolder}
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
          {folders.map((folder) => (
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
                  {/* Folder initials (first 2 letters) */}
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
          ))}
        </ul>
      </nav>
    </aside>
  );
}
