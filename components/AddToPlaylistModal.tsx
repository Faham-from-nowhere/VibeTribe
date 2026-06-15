"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import useAddToPlaylistModal from '@/hooks/useAddToPlaylistModal';
import { useUser } from '@/hooks/useUser';
import { Playlist } from '@/types';

import Modal from './Modal';
import Button from './Button';

const AddToPlaylistModal = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addToPlaylistModal = useAddToPlaylistModal();
  const supabaseClient = createClient();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (addToPlaylistModal.isOpen && user) {
      const fetchPlaylists = async () => {
        const { data, error } = await supabaseClient
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPlaylists(data as Playlist[]);
        }
      };

      fetchPlaylists();
    }
  }, [addToPlaylistModal.isOpen, user, supabaseClient]);

  const onChange = (open: boolean) => {
    if (!open) {
      addToPlaylistModal.onClose();
    }
  }

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!user || !addToPlaylistModal.songId) return;

    try {
      setIsLoading(true);

      // Check if already in playlist
      const { data: existingData } = await supabaseClient
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .eq('song_id', addToPlaylistModal.songId)
        .single();

      if (existingData) {
        toast.error('Song is already in this playlist');
        setIsLoading(false);
        return;
      }

      const { error } = await supabaseClient
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: addToPlaylistModal.songId,
        });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Added to playlist!');
        router.refresh();
        addToPlaylistModal.onClose();
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title="Add to Playlist"
      description="Select a playlist to add this song to."
      isOpen={addToPlaylistModal.isOpen}
      onChange={onChange}
    >
      <div className="flex flex-col gap-y-2 mt-4 max-h-[50vh] overflow-y-auto">
        {playlists.length === 0 ? (
          <div className="text-neutral-400 text-sm">No playlists found. Create one first!</div>
        ) : (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              disabled={isLoading}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full text-left p-3 rounded-md hover:bg-neutral-800 transition bg-neutral-900 border border-transparent hover:border-neutral-700 disabled:opacity-50"
            >
              {playlist.name}
            </button>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-800">
        <Button onClick={addToPlaylistModal.onClose} className="bg-transparent border border-neutral-700 text-white hover:bg-neutral-800">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default AddToPlaylistModal;
