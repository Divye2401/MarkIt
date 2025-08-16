import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders, createFolder } from "../../utils/Frontend/FolderHelpers";
import { fetchResearchProjects } from "../../utils/Frontend/ResearchHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Sidebar for displaying folder shortcuts and creating new folders.
export default function Sidebar({
  selectedFolderId = null,
  onSelectFolder = () => {},
}) {
  const [hovered, setHovered] = useState(false);
  const sidebarWidth = hovered ? "w-64" : "w-30";
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

  const { data: researchProjects = [], isLoading: isLoadingResearch } =
    useQuery({
      queryKey: ["research-projects-sidebar"],
      queryFn: fetchResearchProjects,
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
      className={`min-h-screen hidden md:flex bg-background ml-4 my-4 mr-2 border border-border/30 rounded-2xl flex-col p-4 transition-all duration-400 ease-in-out shadow-lg dark:border-r-3 dark:border-r-white ${sidebarWidth}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex items-center justify-between mb-2 transition-all duration-400 ease-in-out ${
          hovered ? "px-2" : "px-0"
        }`}
      >
        {hovered ? (
          <h2 className="text-heading-sm text-foreground font-bold">
            📁 Filter By Folders
          </h2>
        ) : (
          <span className="text-heading-sm text-foreground">📁</span>
        )}
        {hovered && (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/folder")}
              aria-label="Go to Folders"
              className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-300 hover:scale-110"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNewFolderModal(true)}
              aria-label="Add Folder"
              className="bg-surface-elevated hover:bg-primary/20 text-foreground hover:text-primary rounded-xl transition-all duration-300 hover:scale-110"
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
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium hover:scale-[1.02] ${
                !selectedFolderId
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                  : "hover:bg-surface-elevated text-foreground-secondary hover:shadow-sm"
              }`}
              onClick={() => onSelectFolder(null)}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/30 text-primary font-bold">
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
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-400 ease-in-out font-medium hover:scale-[1.02] ${
                    selectedFolderId === folder.id
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                      : "hover:bg-surface-elevated text-foreground-secondary hover:shadow-sm"
                  }`}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <span
                    className={`flex items-center justify-center ${
                      hovered ? "w-20 h-8" : "w-20 h-8"
                    } rounded-xl bg-gradient-to-br from-surface-elevated to-surface text-foreground font-bold text-caption shadow-sm dark:text-white`}
                  >
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

        {/* Divider */}
        <div className="my-4 border-t border-border/30"></div>

        {/* Research Projects Section */}
        <div
          className={`mb-4 transition-all duration-400 ease-in-out ${
            hovered ? "px-2" : "px-0"
          }`}
        >
          {hovered ? (
            <div className="flex items-center justify-between">
              <h3 className="text-heading-sm text-foreground font-bold">
                Research Projects
              </h3>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => router.push("/research")}
                aria-label="Add Folder"
                className="bg-surface-elevated hover:bg-primary/20 text-foreground hover:text-primary rounded-xl transition-all duration-300 hover:scale-110"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <span className="text-heading-sm text-foreground">🔬</span>
          )}
        </div>

        <ul className="space-y-1">
          {isLoadingResearch ? (
            <li className="text-body-sm text-foreground-muted px-2 py-2">
              Loading research...
            </li>
          ) : researchProjects.length === 0 ? (
            hovered && (
              <li className="text-body-sm text-foreground-muted px-2 py-2">
                No research projects yet
              </li>
            )
          ) : (
            researchProjects.slice(0, 5).map((project) => (
              <li key={project.id}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-400 ease-in-out font-medium hover:scale-[1.02] hover:bg-surface-elevated text-foreground-secondary hover:shadow-sm"
                  onClick={() => router.push(`/research/${project.id}`)}
                >
                  <span
                    className={`flex items-center justify-center ${
                      hovered ? "min-w-20 h-8" : "min w-20 h-8"
                    } rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 font-bold text-caption shadow-sm dark:text-white`}
                  >
                    {project.thesis_statement?.slice(0, 2).toUpperCase() ||
                      "RP"}
                  </span>
                  {hovered && (
                    <>
                      <span className="truncate text-body">
                        {project.thesis_statement || "Untitled Research"}
                      </span>
                      <span className="ml-auto text-caption text-foreground-muted">
                        {project.bookmark_ids?.length || 0}
                      </span>
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
        <DialogContent className="bg-surface/95 backdrop-blur-sm text-foreground border border-border/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-heading-md font-bold text-primary">
              📁 Create New Folder
            </DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="px-4 py-3 rounded-xl border border-border/50 bg-surface-elevated/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-4 transition-all duration-300"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <textarea
            className="px-4 py-3 rounded-xl border border-border/50 bg-surface-elevated/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-4 transition-all duration-300"
            placeholder="Description (optional)"
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            rows={2}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="default"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg bg-gradient-to-r from-primary to-primary-hover rounded-xl px-6"
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
              className="rounded-xl px-6 transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
