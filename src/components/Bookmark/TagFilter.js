import { useState, useEffect } from "react";

export default function TagFilter({ bookmarks, selectedTags, onTagSelect }) {
  const [tagQuery, setTagQuery] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Extract all unique tags when bookmarks change
  useEffect(() => {
    if (bookmarks && bookmarks.length > 0) {
      const tags = Array.from(
        new Set(bookmarks.flatMap((b) => (b.tags ? b.tags : [])))
      );
      setAllTags(tags);
    }
  }, [bookmarks]);

  // Filter tags for autocomplete
  const matchingTags = tagQuery
    ? allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(tagQuery.toLowerCase()) &&
          !selectedTags.includes(tag)
      )
    : allTags.filter((tag) => !selectedTags.includes(tag));

  return (
    <div className="w-full flex justify-center   px-4">
      <div className="w-full max-w-xl relative">
        <input
          type="text"
          placeholder="Filter by tag..."
          className="w-full px-4 py-2 rounded-lg border border-border dark:border-2 dark:border-white da bg-surface text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary dark:focus-visible:ring-white dark:focus-visible:border-white  transition text-body placeholder:text-foreground-muted"
          value={tagQuery}
          onChange={(e) => {
            setTagQuery(e.target.value);
            setShowTagDropdown(true);
          }}
          onFocus={() => setShowTagDropdown(true)}
          onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
        />
        {showTagDropdown && matchingTags.length > 0 && (
          <div className="absolute z-20 bg-surface-elevated border border-border rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto">
            {matchingTags.map((tag) => (
              <div
                key={tag}
                className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-body text-foreground transition"
                onClick={() => {
                  onTagSelect([...selectedTags, tag]);
                  setTagQuery("");
                  setShowTagDropdown(false);
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
        {selectedTags && selectedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="text-caption bg-primary/10 text-primary rounded px-2 py-0.5 flex items-center gap-1"
              >
                {tag}
                <button
                  className="ml-1 text-caption text-error hover:underline transition"
                  onClick={() => {
                    onTagSelect(selectedTags.filter((t) => t !== tag));
                  }}
                  tabIndex={-1}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              className="text-caption text-error hover:underline ml-2 transition"
              onClick={() => {
                onTagSelect([]);
                setTagQuery("");
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
