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
    <div className="w-full flex justify-center mt-2 mb-4 px-4">
      <div className="w-full max-w-xl relative">
        <input
          type="text"
          placeholder="Filter by tag..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-base bg-white"
          value={tagQuery}
          onChange={(e) => {
            setTagQuery(e.target.value);
            setShowTagDropdown(true);
          }}
          onFocus={() => setShowTagDropdown(true)}
          onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
        />
        {showTagDropdown && matchingTags.length > 0 && (
          <div className="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-md mt-1 w-full max-h-48 overflow-y-auto">
            {matchingTags.map((tag) => (
              <div
                key={tag}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
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
                className="text-sm bg-blue-100 text-blue-700 rounded px-2 py-0.5 flex items-center gap-1"
              >
                {tag}
                <button
                  className="ml-1 text-xs text-red-500 hover:underline"
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
              className="text-xs text-red-500 hover:underline ml-2"
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
