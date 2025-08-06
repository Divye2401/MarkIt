import { supabase } from "../supabaseClient";
import { fetchUser, getAccessToken } from "../Providers/AuthHelpers";

export const handleAddBookmark = async (url, mediaUrl = "") => {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/magic-save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, mediaUrl }),
  });
  const data = await res.json();
  console.log("Magic Save API response:", data);
  return data;
};

export async function fetchBookmarks() {
  const user = await fetchUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function searchBookmarks(query) {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/semantic-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data;
}

export async function fetchBookmarkById(id) {
  const user = await fetchUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export const updateBookmark = async ({
  id,
  title,
  summary,
  reading_time,
  url,
  tags,
  is_favorite,
  thumbnail_url,
  bigger_summary,
  notes,
}) => {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/magic-save", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      id,
      title,
      summary,
      reading_time,
      url,
      tags,
      is_favorite,
      thumbnail_url,
      notes,
      bigger_summary,
    }),
  });
  const data = await res.json();
  return data;
};

export const deleteBookmark = async (id) => {
  const accessToken = await getAccessToken();
  const res = await fetch("/api/magic-save", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  return data;
};

export const uploadBookmarkImage = async (file, userId) => {
  if (!file || !userId) throw new Error("File and userId are required");
  const filePath = `user-${userId}/${Date.now()}-${file.name}`;

  console.log("filePath", filePath, "user", userId, "file", file);

  const { data, error } = await supabase.storage
    .from("bookmark-thumbnails")
    .upload(filePath, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage
    .from("bookmark-thumbnails")
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};
