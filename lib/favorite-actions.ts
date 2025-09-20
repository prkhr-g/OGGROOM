"use server";

import { createServerClient } from "@/lib/supabase-server";

export async function toggleFavoriteShop(shopId: string) {
  console.log("Toggling favorite for shop:", shopId);
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to favorite a shop." };
  }

  const { data, error } = await supabase.rpc("toggle_favorite_shop", {
    p_shop_id: shopId,
  });

  if (error) {
    console.error("Error toggling favorite shop:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getFavoriteShops() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { shops: [] };
  }

  const { data, error } = await supabase.rpc("get_favorite_shops");

  if (error) {
    console.error("Error fetching favorite shops:", error);
    return { error: error.message };
  }

  return { shops: data };
}
