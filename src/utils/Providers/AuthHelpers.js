"use client";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

export async function fetchUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useUser() {
  // Store user session in cache
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
}

// 2️⃣ Listen for auth state changes globally
export function useAuthListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      //listener that keeps on running throughout
      queryClient.invalidateQueries(["user"]); // a callback fxn to run on authstatechanging
    });

    return () => subscription?.subscription.unsubscribe();
  }, [queryClient]);
}

// 3️⃣ Logout helper
export async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Logout failed:", error.message);
}
