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
          <DialogTitle className="text-heading-md text-foreground">
            Add User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-heading-sm text-foreground">User Email:</label>
          <input
            type="email"
            className={`border rounded px-3 py-2 w-full bg-surface text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              touched && !valid ? "border-error" : "border-border"
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
            <span className="text-error text-body-sm">
              Please enter a valid email address.
            </span>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              className="px-4 py-2 bg-surface text-foreground-secondary rounded hover:bg-surface-elevated transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover disabled:opacity-50 transition"
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
