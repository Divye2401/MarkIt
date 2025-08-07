import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "sonner";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AddUserModal({ open, onClose, id }) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = isValidEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call your API route
    const res = await fetch("/api/addusertofolder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, id }),
    });
    const data = await res.json();

    if (data.exists) {
      toast.success(`User exists! Added to folder!`);
    } else {
      toast.error("Error adding user to folder!");
    }
    setEmail("");
    setTouched(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold text-zinc-700">User Email:</label>
          <input
            type="email"
            className={`border rounded px-3 py-2 w-full ${
              touched && !valid ? "border-red-500" : ""
            }`}
            placeholder="user@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setTouched(true);
            }}
            required
          />
          {touched && !valid && (
            <span className="text-red-500 text-sm">
              Please enter a valid email address.
            </span>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!valid}
            >
              Add
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
