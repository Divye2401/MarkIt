"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus } from "lucide-react";

const dummyFolders = [
  { id: 1, name: "Work", count: 5 },
  { id: 2, name: "Personal", count: 2 },
  { id: 3, name: "Reading List", count: 8 },
];

export default function FolderPage() {
  const [folders] = useState(dummyFolders);
  const [showInput, setShowInput] = useState(false);
  const [newFolder, setNewFolder] = useState("");

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Folders</h1>
        <Button onClick={() => setShowInput((v) => !v)}>
          <Plus className="mr-2" />
          Add Folder
        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="p-4 bg-white rounded shadow flex items-center justify-between"
          >
            <span className="font-medium">{folder.name}</span>
            <span className="text-xs text-gray-500">
              {folder.count} bookmarks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
