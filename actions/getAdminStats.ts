import { supabaseAdmin } from "@/libs/supabaseAdmin";

export const getAdminStats = async () => {
  const [songsRes, usersRes, subscriptionsRes] = await Promise.all([
    supabaseAdmin.from('songs').select('id', { count: 'exact' }).limit(1),
    supabaseAdmin.from('users').select('id', { count: 'exact' }).limit(1),
    supabaseAdmin.from('subscriptions').select('id', { count: 'exact' }).limit(1),
  ]);

  if (songsRes.error) console.error("Songs count error:", songsRes.error);
  if (usersRes.error) console.error("Users count error:", usersRes.error);
  if (subscriptionsRes.error) console.error("Subscriptions count error:", subscriptionsRes.error);

  return {
    songs: songsRes.count || 0,
    users: usersRes.count || 0,
    subscriptions: subscriptionsRes.count || 0,
  };
};
