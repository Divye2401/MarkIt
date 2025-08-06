"use client";
export default function BookmarkWelcome({ user, bookmarks }) {
  // Extract first name from user (if available)
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "User";
  // Hide if bookmarks exist
  if (bookmarks && bookmarks.length > 0) {
    return (
      <div className="ml-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-4">
          Welcome, {firstName}!
        </h1>
        <p className="text-gray-600 mb-6">Here are your current bookmarks!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-140">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome, {firstName}!
      </h1>

      <p className="text-gray-600 mb-6">
        Your bookmarks will appear here. Start by adding your first bookmark!
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">
          Bookmark dashboard coming soon...
        </p>
      </div>
    </div>
  );
}
