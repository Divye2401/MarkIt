import { supabase } from "../supabaseClient";
import { fetchUser } from "../Providers/AuthHelpers";

export const handleAddBookmark = async (url, mediaUrl = "") => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
