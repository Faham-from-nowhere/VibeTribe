import Player from "@/components/Player";
import Sidebar from "@/components/Sidebar";
import getSongsByUserId from "@/actions/getSongsByUserId";
import getPlaylists from "@/actions/getPlaylists";

export const revalidate = 0;

export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const userSongs = await getSongsByUserId();
  const playlists = await getPlaylists();

  return (
    <>
      <Sidebar songs={userSongs} playlists={playlists}>{children}</Sidebar>
      <Player />
    </>
  );
}
