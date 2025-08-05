import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useState, useRef, useEffect } from "react";

export default function BookmarkCard({ bookmark }) {
  const [hovered, setHovered] = useState(false);
  const [modalHeight, setModalHeight] = useState(0);
  const modalRef = useRef(null);

  // Measure modal height when hovered
  useEffect(() => {
    if (hovered && modalRef.current) {
      setModalHeight(modalRef.current.scrollHeight);
    }
  }, [hovered, bookmark]); // re-measure if hovered or content changes

  // Estimate header height (adjust if you change header size)
  const headerHeight = 72; // px, adjust as needed

  return (
    <Card
      className="relative min-h-[120px] border overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: hovered ? headerHeight + modalHeight : headerHeight,
        background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
        transition: "all 0.3s",
      }}
    >
      <CardHeader>
        <CardTitle asChild className="truncate text-blue-700 pb-1">
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
            {bookmark.title || bookmark.url}
          </a>
        </CardTitle>
      </CardHeader>
      {/* Slide-up modal (absolutely positioned) */}
      <div
        ref={modalRef}
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          background: "rgba(255,255,255,0.98)",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
          opacity: hovered ? 0.95 : 0,
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "all 0.3s",
          zIndex: 10,
        }}
      >
        <CardContent className="pt-2 pb-4 pointer-events-auto">
          <div className="text-gray-700 text-sm mb-2">{bookmark.summary}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {bookmark.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            {bookmark.reading_time ? `⏱️ ${bookmark.reading_time} min` : ""}
            {bookmark.duration ? ` | 🎵 ${bookmark.duration} min` : ""}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
