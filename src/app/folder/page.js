"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, ArrowLeft, Folder as FolderIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders } from "../../utils/Frontend/FolderHelpers";
import { useRouter } from "next/navigation";

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
            className="p-5 bg-white rounded-xl shadow flex items-center gap-4 cursor-pointer hover:bg-blue-50 transition border border-gray-100"
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
        ))}
      </div>
    </div>
  );
}
