import { supabase } from "../supabaseClient";
import { fetchUser } from "../Providers/AuthHelpers";

export async function fetchFolderById(folderId) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", folderId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
// Fetch all folders for the current user (using user_ids array)
export async function fetchFolders() {
  const user = await fetchUser();
  if (!user) throw new Error("Not authenticated");
  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .contains("user_ids", [user.id]);
  if (error) throw new Error(error.message);
  return folders;
}

// Fetch all folders containing a specific bookmark (using bookmark_ids array)
export async function fetchFoldersByBookmarkId(bookmarkId) {
  const user = await fetchUser();
  if (!user) throw new Error("Not authenticated");
  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .contains("bookmark_ids", [bookmarkId])
    .contains("user_ids", [user.id]); // Only folders the user has access to
  if (error) throw new Error(error.message);
  return folders;
}

// Add a bookmark to a folder (push bookmarkId to bookmark_ids array)
export async function addBookmarkToFolder(folderId, bookmarkId) {
  // Fetch current bookmark_ids
  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("bookmark_ids, doc_count, total_time")
    .eq("id", folderId)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  const currentIds = folder.bookmark_ids || [];

  if (currentIds.includes(bookmarkId)) {
    return { success: true, alreadyPresent: true };
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("reading_time")
    .eq("id", bookmarkId)
    .single();

  const doc_count = (folder.doc_count || 0) + 1;
  const total_time = (folder.total_time || 0) + (data.reading_time || 0);

  const newIds = [...currentIds, bookmarkId];
  const { error: updateError } = await supabase
    .from("folders")
    .update({
      bookmark_ids: newIds,
      doc_count: doc_count,
      total_time: total_time,
    })
    .eq("id", folderId);
  if (updateError) throw new Error(updateError.message);
  return { success: true };
}

// Create a new folder for the current user
export async function createFolder({ name, description = null }) {
  const user = await fetchUser();
  if (!user) throw new Error("Not authenticated");
  if (!name || !name.trim()) throw new Error("Folder name is required");
  const { data, error } = await supabase
    .from("folders")
    .insert([
      {
        name: name.trim(),

        description,
        user_ids: [user.id],
        bookmark_ids: [],
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFolder(folderId) {
  const { error } = await supabase.from("folders").delete().eq("id", folderId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function removeBookmarkFromFolder(folderId, bookmarkId) {
  // Fetch current bookmark_ids
  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("bookmark_ids, doc_count, total_time")
    .eq("id", folderId)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  const currentIds = folder.bookmark_ids || [];
  if (!currentIds.includes(bookmarkId)) {
    return { success: true, alreadyRemoved: true };
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("reading_time")
    .eq("id", bookmarkId)
    .single();

  const doc_count = (folder.doc_count || 0) - 1;
  const total_time = (folder.total_time || 0) - (data.reading_time || 0);

  const newIds = currentIds.filter((id) => id !== bookmarkId);
  const { error: updateError } = await supabase
    .from("folders")
    .update({
      bookmark_ids: newIds,
      doc_count: doc_count,
      total_time: total_time,
    })
    .eq("id", folderId);
  if (updateError) throw new Error(updateError.message);
  return { success: true };
}
