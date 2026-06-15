import Player from "@/components/Player";
import Sidebar from "@/components/Sidebar";
import getSongsByUserId from "@/actions/getSongsByUserId";

export const revalidate = 0;

export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const userSongs = await getSongsByUserId();

  return (
    <>
      <Sidebar songs={userSongs}>{children}</Sidebar>
      <Player />
    </>
  );
}
