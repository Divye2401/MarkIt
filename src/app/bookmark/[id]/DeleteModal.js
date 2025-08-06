import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function DeleteModal({ open, onClose, onDelete }) {
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bookmark</DialogTitle>
        </DialogHeader>
        <div>Are you sure you want to delete this bookmark?</div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
