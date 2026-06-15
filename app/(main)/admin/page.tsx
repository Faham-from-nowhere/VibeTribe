import { createClient } from "@/libs/supabase/server";
import { getAdminStats } from "@/actions/getAdminStats";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const { data: userDetails } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userDetails?.is_admin) {
    return (
      <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
        <Header>
          <div className="mb-2 flex flex-col gap-y-6">
            <h1 className="text-white text-3xl font-semibold">Access Denied</h1>
          </div>
        </Header>
        <div className="px-6">
          <p className="text-neutral-400 text-lg">You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  const stats = await getAdminStats();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">Admin Dashboard</h1>
        </div>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-md shadow-neutral-950/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-neutral-400 text-lg font-medium mb-2">Total Songs</h2>
            <p className="text-white text-5xl font-bold">{stats.songs}</p>
          </div>
          {/* Card 2 */}
          <div className="bg-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-md shadow-neutral-950/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-neutral-400 text-lg font-medium mb-2">Total Users</h2>
            <p className="text-white text-5xl font-bold">{stats.users}</p>
          </div>
          {/* Card 3 */}
          <div className="bg-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-md shadow-neutral-950/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-neutral-400 text-lg font-medium mb-2">Active Subscriptions</h2>
            <p className="text-white text-5xl font-bold">{stats.subscriptions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
