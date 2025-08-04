"use client";
export default function BookmarkCard({ bookmark }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-blue-600 hover:underline"
        >
          {bookmark.title || bookmark.url}
        </a>
        <span className="text-xs bg-gray-200 rounded px-2 py-1">
          {bookmark.content_type}
        </span>
      </div>
      <div className="text-gray-700 text-sm line-clamp-4">
        {bookmark.summary}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {bookmark.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {bookmark.reading_time ? `⏱️ ${bookmark.reading_time} min` : ""}
        {bookmark.duration ? ` | 🎵 ${bookmark.duration} min` : ""}
      </div>
    </div>
  );
}
