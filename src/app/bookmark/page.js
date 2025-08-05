"use client";
import { useState } from "react";
import { useUser } from "../../utils/Providers/AuthHelpers";
import { useRouter } from "next/navigation";
import LoginPrompt from "../../components/Login/LoginPrompt";
import AddBookmarkButton from "../../components/Bookmark/AddBookmarkButton";
import AddBookmarkModal from "../../components/Bookmark/AddBookmarkModal";
import BookmarkNavbar from "../../components/Bookmark/BookmarkNavbar";
import BookmarkWelcome from "../../components/Bookmark/BookmarkWelcome";
import { handleAddBookmark } from "../../utils/Frontend/BookmarkHelpers";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarks } from "../../utils/Frontend/BookmarkHelpers";
import BookmarkCard from "../../components/Bookmark/BookmarkCard";

export default function BookmarkPage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const [showInput, setShowInput] = useState(false);

  const AddBookmark = async (url, mediaUrl = "") => {
    await handleAddBookmark(url, mediaUrl);
  };

  // TEMP: Use static bookmarks for hover bug test
  const testBookmarks = [
    {
      id: "1",
      url: "https://a.com",
      title: "A",
      summary: "Summary A",
      tags: ["tag1"],
      reading_time: 1,
      duration: 1,
    },
    {
      id: "2",
      url: "https://b.com",
      title: "B",
      summary: "Summary B",
      tags: ["tag2"],
      reading_time: 2,
      duration: 2,
    },
  ];

  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
  });

  // Logout handler with redirect
  const onLogout = async () => {
    await handleLogout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookmarkNavbar user={user} onLogout={onLogout} />
      <BookmarkWelcome user={user} bookmarks={bookmarks} />
      <AddBookmarkButton onClick={() => setShowInput(true)} />
      <AddBookmarkModal
        open={showInput}
        onClose={() => setShowInput(false)}
        onAdd={AddBookmark}
      />
      {bookmarksLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
          {bookmarks.map((b) => (
            <BookmarkCard key={b.id} bookmark={b} />
          ))}
        </div>
      )}
    </div>
  );
}
