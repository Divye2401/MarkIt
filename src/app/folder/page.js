"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Plus,
  ArrowLeft,
  Folder as FolderIcon,
  Lightbulb,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders } from "../../utils/Frontend/FolderHelpers";
import { useRouter } from "next/navigation";
import { getFolderInsights } from "../../utils/Frontend/FolderHelpers";

export default function FolderPage() {
  const router = useRouter();
  const {
    data: folders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["folders-page"],
    queryFn: fetchFolders,
  });
  const [showInput, setShowInput] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [selectedInsights, setSelectedInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const handleGetInsights = async (folderId) => {
    setInsightsLoading(true);
    try {
      const data = await getFolderInsights(folderId);
      const insights = JSON.parse(data.insights);
      console.log(insights);
      setSelectedInsights(insights);
    } catch (error) {
      console.error("Failed to get insights:", error);
    }
    setInsightsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center mb-6 gap-4">
        {/* Black Arrow Button for Back */}
        <button
          className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-900 transition"
          aria-label="Back"
          type="button"
          onClick={() => router.back()}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Folders</h1>
        <div className="flex-1 flex justify-end">
          <Button onClick={() => setShowInput((v) => !v)}>
            <Plus className="mr-2" />
            Add Folder
          </Button>
        </div>
      </div>
      {showInput && (
        <div className="flex gap-2 mb-6">
          <Input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Folder name"
            className="w-full"
          />
          <Button disabled>Save</Button>
        </div>
      )}
      {isLoading && <div className="text-gray-500">Loading folders...</div>}
      {isError && (
        <div className="text-red-500">
          {error?.message || "Failed to load folders."}
        </div>
      )}
      <div className="flex flex-col gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="p-5 bg-white rounded-xl shadow flex items-center gap-4 hover:bg-blue-50 transition border border-gray-100"
          >
            <div
              className="flex-1 flex items-center gap-4 cursor-pointer"
              onClick={() => router.push(`/folder/${folder.id}`)}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                <FolderIcon size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate">
                  {folder.name}
                </div>
                {folder.description && (
                  <div className="text-gray-500 text-sm truncate">
                    {folder.description}
                  </div>
                )}
                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                  <span>{folder.doc_count ?? 0} bookmarks</span>
                  {folder.updated_at && (
                    <span>
                      Last updated:{" "}
                      {new Date(folder.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGetInsights(folder.id);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Get AI Insights"
            >
              <Lightbulb size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Insights Panel */}
      {selectedInsights && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Folder Insights</h2>
              <button
                onClick={() => setSelectedInsights(null)}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Insights Content */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Main Insights</h3>
                <p className="text-gray-700">{selectedInsights.insights[0]}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Suggested Improvements</h3>
                <p className="text-gray-700">
                  {selectedInsights.improvements[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {insightsLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
            <div className="animate-pulse">Generating insights...</div>
          </div>
        </div>
      )}
    </div>
  );
}
