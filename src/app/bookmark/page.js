/* eslint-disable @next/next/no-img-element */
"use client";
// --- React & Next Imports ---
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Auth & Data Helpers ---
import { useUser, handleLogout } from "../../utils/Providers/AuthHelpers";
import { useTheme } from "../../utils/Providers/ThemeProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBookmarks,
  handleAddBookmark,
} from "../../utils/Frontend/BookmarkHelpers";
import { fetchFolderById } from "../../utils/Frontend/FolderHelpers";

// --- UI Components ---
import Sidebar from "../../components/Bookmark/Sidebar";
import BookmarkNavbar from "../../components/Bookmark/BookmarkNavbar";
import LoginPrompt from "../../components/Login/LoginPrompt";
import AddBookmarkButton from "../../components/Bookmark/AddBookmarkButton";
import AddBookmarkModal from "../../components/Bookmark/AddBookmarkModal";
import BookmarkCard from "../../components/Bookmark/BookmarkCard";
import TagFilter from "../../components/Bookmark/TagFilter";
import SearchResultsDialog from "../../components/Bookmark/SearchResultsDialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, ArrowLeft, ArrowRight, Loader } from "lucide-react";
import { toast } from "sonner";
import { searchBookmarks } from "../../utils/Frontend/BookmarkHelpers";
import BookmarkClusterMap from "./BookmarkClusterMap";
import KnowledgeGapAnalysis from "./KnowledgeGapAnalysis";

// --- Main Page Component ---
export default function BookmarkPage() {
  // --- Router & Auth ---
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();

  // --- UI State ---
  const [showInput, setShowInput] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  // TODO: Replace with real fetch
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const { theme } = useTheme();

  // --- Send token to extension ---
  useEffect(() => {
    const sendTokenToExtension = async () => {
      if (user) {
        // Check if we've already sent the token recently
        const lastTokenSent = localStorage.getItem("extension_token_sent");
        const halfhourAgo = Date.now() - 5 * 60 * 1000;

        if (lastTokenSent && parseInt(lastTokenSent) > halfhourAgo) {
          return; // Token was sent recently, no need to send again
        }

        // Get session from Supabase
        const { supabase } = await import("../../utils/supabaseClient");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          window.postMessage(
            {
              type: "LOGIN_SUCCESS",
              token: session.access_token,
            },
            "https://markit-cyan.vercel.app/"
          );
          console.log("Token sent to extension");
          localStorage.setItem("extension_token_sent", Date.now().toString());
        }
      }
    };

    sendTokenToExtension();
  }, [user]);

  // --- Clean URL after user is authenticated ---
  useEffect(() => {
    if (user && window.location.hash.includes("access_token")) {
      // Small delay to ensure Supabase has processed the token
      setTimeout(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 200);
    }
  }, [user]);

  // --- Data Fetching ---JG
  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    refetchOnWindowFocus: false,
  });

  // --- Folder details for filtering ---
  const { data: selectedFolder, isLoading: folderLoading } = useQuery({
    queryKey: ["folder", selectedFolderId],
    queryFn: () =>
      selectedFolderId ? fetchFolderById(selectedFolderId) : null,
    enabled: !!selectedFolderId,
  });

  // --- Bookmark Add Handler ---
  const AddBookmark = async (url, mediaUrl = "") => {
    const toastId = toast.loading("Adding bookmark...");
    try {
      const data = await handleAddBookmark(url, mediaUrl);
      if (data.success) {
        toast.success("Bookmark added!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to add bookmark.", { id: toastId });
      }
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (err) {
      toast.error("Failed to add bookmark.", { id: toastId });
    }
  };

  // --- Search Handler ---
  const handleSearch = async () => {
    if (searchValue.trim().length >= 8) {
      const toastId = toast.loading("Searching bookmarks...");
      setIsSearchLoading(true);
      try {
        const result = await searchBookmarks(searchValue.trim());
        toast.success("Search completed", { id: toastId });
        setSearchResults(result);
        setSearchModalOpen(true);
      } catch (error) {
        console.error("Error searching bookmarks:", error);
        toast.error("Error searching bookmarks", { id: toastId });
      } finally {
        setIsSearchLoading(false);
      }
    }
  };

  // --- Add Suggested Link Handler ---
  const handleAddSuggested = async (link) => {
    const toastId = toast.loading("Adding bookmark to your collection...");
    setAddingId(link.url);
    await handleAddBookmark(link.url);
    setAddingId(null);
    setSearchResults((prev) => ({
      ...prev,
      suggestedLinks: prev.suggestedLinks.filter((l) => l.url !== link.url),
    }));
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    toast.success("Bookmark added to your collection", { id: toastId });
  };

  // --- Filtering Logic ---
  const filteredBookmarks =
    selectedTags.length > 0
      ? bookmarks.filter(
          (b) => b.tags && selectedTags.every((tag) => b.tags.includes(tag))
        )
      : bookmarks;

  const folderFilteredBookmarks =
    selectedFolderId && selectedFolder && selectedFolder.bookmark_ids
      ? filteredBookmarks.filter((b) =>
          selectedFolder.bookmark_ids.includes(b.id)
        )
      : filteredBookmarks;

  // --- Sorting ---
  const sortedBookmarks = [...folderFilteredBookmarks].sort((a, b) => {
    if (a.is_favorite === b.is_favorite) return 0;
    return a.is_favorite ? -1 : 1;
  });

  // --- Folder Creation Handler (placeholder) ---
  const handleCreateFolder = () => {
    alert("Create folder clicked (implement this)");
  };

  // --- Logout Handler ---
  const onLogout = async () => {
    await handleLogout();
    router.push("/");
  };

  // --- Loading & Auth States ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-heading-md text-zinc-400">Loading...</div>
      </div>
    );
  }
  if (!user) {
    return <LoginPrompt />;
  }

  console.log(bookmarks.length);
  //

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Main Layout Container */}
      <div className="flex bg-background  ">
        {/* Sidebar */}
        <Sidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
        />
        {/* Main content */}
        <div className="flex-1 relative px-5">
          {/* Background image with overlay */}
          {theme === "dark" ? (
            <div className="absolute inset-0 z-0 bg-background"></div>
          ) : (
            <div className="absolute inset-0 z-0 bg-background"></div>
          )}

          <div className="relative z-10">
            <BookmarkNavbar
              user={user}
              bookmarks={bookmarks}
              onLogout={onLogout}
              bookmarksLength={bookmarks.length}
            />
            {bookmarks.length === 0 && (
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center flex flex-col items-center gap-4">
                  <p className="text-zinc-400 text-2xl font-bold dark:text-white">
                    No bookmarks found. Add some to get started.
                  </p>
                  <AddBookmarkButton
                    onClick={() => setShowInput(true)}
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            )}
            {bookmarks.length > 0 && (
              <div className="w-full px-4 mt-4 mb-4">
                <div className="flex flex-col md:flex-row items-end gap-4 w-full">
                  {/* Tag Filter */}
                  <div className="w-full md:w-1/3 flex items-end gap-2 ">
                    <TagFilter
                      bookmarks={bookmarks}
                      selectedTags={selectedTags}
                      onTagSelect={setSelectedTags}
                    />
                  </div>
                  {/* Search Bar, Button, and Add Bookmark on the right */}
                  <div className="flex flex-row items-end gap-4 w-full md:w-2/3 justify-end">
                    <div className="relative w-full md:w-2/3">
                      <Input
                        type="text"
                        placeholder="Search through your documents..."
                        className="pl-10 pr-4 py-3 w-full rounded-lg bg-background border-2 border-zinc-600 dark:border-white focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500/20 dark:focus-visible:ring-white dark:focus-visible:border-white transition-all placeholder:text-zinc-400 text-zinc-200"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        size={18}
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="px-6 py-3 rounded-lg bg-button text-white hover:bg-button/80 transition-all font-medium ml-2"
                      disabled={
                        searchValue.trim().length < 8 || isSearchLoading
                      }
                    >
                      {isSearchLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                    <AddBookmarkButton
                      onClick={() => setShowInput(true)}
                      width={60}
                      height={36}
                    />
                    <Button
                      onClick={() => router.push("/research")}
                      className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all font-medium text-sm"
                    >
                      Research Section
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Search Results Modal */}
            <SearchResultsDialog
              open={searchModalOpen}
              onOpenChange={setSearchModalOpen}
              searchResults={searchResults}
              addingId={addingId}
              handleAddSuggested={handleAddSuggested}
            />
            {/* Add Bookmark Button & Modal */}
            <AddBookmarkModal
              open={showInput}
              onClose={() => setShowInput(false)}
              onAdd={AddBookmark}
            />

            {/* Bookmarks Grid */}
            {bookmarksLoading ? (
              <div className="text-center py-8">
                <div className="text-body text-zinc-400">
                  Loading bookmarks...
                </div>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start px-4 mb-12">
                {sortedBookmarks.map((b) => (
                  <BookmarkCard
                    key={b.id}
                    bookmark={b}
                    refresh={() => {
                      queryClient.invalidateQueries(["bookmarks"]);
                      refetch();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Bookmark Clusters Visualization */}
            <div className="px-4 mb-12">
              <BookmarkClusterMap bookmarks={sortedBookmarks} />
            </div>

            {/* Knowledge Gap Analysis */}
            <div className="px-4 mb-8">
              <KnowledgeGapAnalysis bookmarks={sortedBookmarks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
