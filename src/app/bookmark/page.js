"use client";
// --- React & Next Imports ---
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Auth & Data Helpers ---
import { useUser, handleLogout } from "../../utils/Providers/AuthHelpers";
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
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
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
  // TODO: Replace with real fetch
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // --- Send token to extension on login ---
  useEffect(() => {
    const sendTokenToExtension = async () => {
      if (user) {
        // Check if we've already sent the token recently
        const lastTokenSent = localStorage.getItem("extension_token_sent");
        const halfhourAgo = Date.now() - 30 * 60 * 1000;

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
            "http://localhost:3000"
          );

          localStorage.setItem("extension_token_sent", Date.now().toString());
        }
      }
    };

    sendTokenToExtension();
  }, [user]);

  // --- Data Fetching ---
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
      const result = await searchBookmarks(searchValue.trim());
      setSearchResults(result);
      setSearchModalOpen(true);
    }
  };

  // --- Add Suggested Link Handler ---
  const handleAddSuggested = async (link) => {
    setAddingId(link.url);
    await handleAddBookmark(link.url);
    setAddingId(null);
    setSearchResults((prev) => ({
      ...prev,
      suggestedLinks: prev.suggestedLinks.filter((l) => l.url !== link.url),
    }));
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  if (!user) {
    return <LoginPrompt />;
  }

  // --- Main Render ---
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
      />
      {/* Main content */}
      <div className="flex-1 relative">
        <BookmarkNavbar user={user} bookmarks={bookmarks} onLogout={onLogout} />
        {bookmarks.length > 0 && (
          <div className="w-full px-4 mt-8 mb-6">
            <div className="flex flex-col md:flex-row items-end gap-4 w-full">
              {/* Tag Filter and Arrow Button on the left */}
              <div className="w-full md:w-1/3 flex items-end gap-2">
                <button
                  className="bg-black text-white rounded-full w-16 h-10 flex items-center justify-center hover:bg-gray-900 transition"
                  aria-label="Front"
                  type="button"
                  onClick={() => {
                    router.push("/folder");
                  }}
                >
                  <ArrowRight size={24} />
                </button>
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
                    className="pl-12 pr-4 py-5 w-full rounded-full bg-white/80 backdrop-blur-md \
                             border border-gray-200 shadow-sm focus:border-blue-400 \
                             focus:ring-2 focus:ring-blue-300 transition-all duration-300\
                             placeholder:text-gray-400 hover:shadow-md"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="scale-100 px-8 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-lg ml-2"
                  disabled={searchValue.trim().length < 8}
                >
                  Search
                </Button>
                <AddBookmarkButton onClick={() => setShowInput(true)} />
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
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start px-4">
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
        <BookmarkClusterMap bookmarks={bookmarks} />

        {/* Knowledge Gap Analysis */}
        <div className="mt-8 px-4">
          <KnowledgeGapAnalysis />
        </div>
      </div>
    </div>
  );
}
