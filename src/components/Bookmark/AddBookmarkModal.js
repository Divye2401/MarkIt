import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function isValidUrl(url) {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(url);
}

export default function AddBookmarkModal({ open, onClose, onAdd }) {
  const [mode, setMode] = useState("text"); // 'text' or 'media'
  const [url, setUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const valid =
    mode === "media"
      ? isValidUrl(url) // Only require page URL to be valid
      : isValidUrl(url);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-foreground/30 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: -50, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-surface-elevated p-6 rounded-xl shadow-lg flex flex-col gap-4 min-w-[320px] mb-[50px] border border-border"
          >
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-1 text-body text-foreground">
                <input
                  type="radio"
                  name="mode"
                  value="text"
                  checked={mode === "text"}
                  onChange={() => setMode("text")}
                  className="text-primary focus:ring-primary"
                />
                Text/Blog
              </label>
              <label className="flex items-center gap-1 text-body text-foreground">
                <input
                  type="radio"
                  name="mode"
                  value="media"
                  checked={mode === "media"}
                  onChange={() => setMode("media")}
                  className="text-primary focus:ring-primary"
                />
                Audio/Video
              </label>
            </div>
            {mode === "media" ? (
              <>
                <label className="text-heading-sm text-foreground">
                  Page URL (required):
                </label>
                <input
                  type="url"
                  className={`border rounded px-3 py-2 w-full bg-surface text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    touched && !isValidUrl(url)
                      ? "border-error"
                      : "border-border"
                  }`}
                  placeholder="https://youtube.com/..., https://podcast.com/episode"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setTouched(true);
                  }}
                  required
                />
                <label className="text-heading-sm text-foreground">
                  Download URL (audio/video, optional):
                </label>
                <input
                  type="url"
                  className="border border-border rounded px-3 py-2 w-full bg-surface text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://example.com/audio.mp3"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setTouched(true);
                  }}
                />
              </>
            ) : (
              <>
                <label className="text-heading-sm text-foreground">
                  Bookmark URL:
                </label>
                <input
                  type="url"
                  className={`border rounded px-3 py-2 w-full bg-surface text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    touched && !isValidUrl(url)
                      ? "border-error"
                      : "border-border"
                  }`}
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setTouched(true);
                  }}
                  autoFocus
                />
              </>
            )}
            {touched && !valid && (
              <span className="text-error text-body-sm">
                Please enter a valid URL.
              </span>
            )}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 bg-surface text-foreground-secondary rounded hover:bg-surface-elevated transition"
                onClick={() => {
                  setUrl("");
                  setMediaUrl("");
                  setTouched(false);
                  setMode("text");
                  onClose();
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover hover:shadow-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => {
                  onAdd(url, mediaUrl);
                  setUrl("");
                  setMediaUrl("");
                  setTouched(false);
                  setMode("text");
                  onClose();
                }}
                disabled={!valid}
              >
                Add
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
