"use client";

import React, { useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import uniqid from "uniqid";

import useCreatePlaylistModal from '@/hooks/useCreatePlaylistModal';
import { useUser } from '@/hooks/useUser';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const CreatePlaylistModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createPlaylistModal = useCreatePlaylistModal();
  const supabaseClient = createClient();
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      image: null,
    }
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      createPlaylistModal.onClose();
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error('Missing user');
        return;
      }

      const imageFile = values.image?.[0];

      let imagePath = null;

      if (imageFile) {
        const uniqueID = uniqid();
        const { 
          data: imageData, 
          error: imageError 
        } = await supabaseClient
          .storage
          .from('images')
          .upload(`playlist-image-${values.name}-${uniqueID}`, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (imageError) {
          setIsLoading(false);
          return toast.error('Failed image upload');
        }

        imagePath = imageData.path;
      }

      // Insert playlist record
      const { error: supabaseError } = await supabaseClient
        .from('playlists')
        .insert({
          user_id: user.id,
          name: values.name,
          image_path: imagePath,
        });

      if (supabaseError) {
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Playlist created!');
      reset();
      createPlaylistModal.onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title="Create a Playlist"
      description="Make a new playlist to organize your favorite tracks."
      isOpen={createPlaylistModal.isOpen}
      onChange={onChange}
    >
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-y-4"
      >
        <Input
          id="name"
          disabled={isLoading}
          {...register('name', { required: true })}
          placeholder="Playlist name"
        />
        <div>
          <div className="pb-1">
            Select an image (optional)
          </div>
          <Input
            placeholder="test"
            disabled={isLoading}
            type="file"
            accept="image/*"
            id="image"
            {...register('image')}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
}

export default CreatePlaylistModal;
