"use client";

import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import uniqid from "uniqid";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { analyzeBPM } from "@/libs/audioAnalyzer";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";

import useUploadModal from "@/hooks/useUploadModal";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";

const UploadModal = () => {
  const uploadModal = useUploadModal();
  const subscribeModal = useSubscribeModal();
  const [isLoading, setIsLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [detectedBpm, setDetectedBpm] = useState<number | null>(null);
  const { user, subscription } = useUser();
  const supabaseClient = createClient();
  const router = useRouter();

  const { register, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null
    }
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      setAiPreview(null);
      setDetectedBpm(null);
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error("Missing Fields.");
        setIsLoading(false);
        return;
      }

      // Subscription & Admin Quota Logic
      if (user.email !== "mohdfahamb@gmail.com" && !subscription) {
        const { count, error: countError } = await supabaseClient
          .from("songs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (countError) {
          toast.error("Could not verify upload quota.");
          setIsLoading(false);
          return;
        }

        if (count && count >= 1) {
          toast.error("Free tier is limited to 1 song upload. Please subscribe!");
          setIsLoading(false);
          uploadModal.onClose();
          subscribeModal.onOpen();
          return;
        }
      }

      const uniqueId = uniqid();

      // Upload Song
      const { data: songData, error: songError } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueId}`, songFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (songError) {
        setIsLoading(false);
        return toast.error("Song Upload Failed.");
      }

      // Upload Image
      const { data: imageData, error: imageError } =
        await supabaseClient.storage
          .from("images")
          .upload(`image-${values.title}-${uniqueId}`, imageFile, {
            cacheControl: "3600",
            upsert: false
          });

      if (imageError) {
        setIsLoading(false);
        return toast.error("Image Upload Failed.");
      }

      const { error: supabaseError } = await supabaseClient
        .from("songs")
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path
        });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success("Song Created!");
      reset();
      setAiPreview(null);
      setDetectedBpm(null);
      uploadModal.onClose();
    } catch (error) {
      toast.error("Something Went Wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Add a Song"
      description="Upload an MP3 File."
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form className="flex flex-col gap-y-4 max-h-[70vh] overflow-y-auto px-2 pb-2 custom-scrollbar" onSubmit={handleSubmit(onSubmit)}>

        <Input
          id="title"
          disabled={isLoading}
          placeholder="Song Title"
          {...register("title", { required: true })}
        />
        <Input
          id="author"
          disabled={isLoading}
          placeholder="Author"
          {...register("author", { required: true })}
        />
        <div>
          <div className="pb-1 flex justify-between items-center">
            <span>Select a Song File.</span>
            {detectedBpm && <span className="text-orange-500 text-sm font-semibold">⚡ Detected BPM: {detectedBpm}</span>}
          </div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register("song", { 
              onChange: async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const bpm = await analyzeBPM(e.target.files[0]);
                    setDetectedBpm(bpm);
                    
                    // Automatically append to author for smart tagging without DB schema changes
                    const authorInput = document.getElementById('author') as HTMLInputElement;
                    if (authorInput && !authorInput.value.includes('[BPM')) {
                      setValue('author', `${authorInput.value} [BPM: ${bpm}]`);
                    }
                  } catch (err) {
                    console.error("BPM Analysis failed", err);
                  }
                }
              }
            })}
          />
        </div>
        <div>
          <div className="pb-1 flex justify-between items-center">
            <span>Select an Image.</span>
            <button 
              type="button" 
              onClick={async () => {
                const titleInput = document.getElementById('title') as HTMLInputElement;
                const authorInput = document.getElementById('author') as HTMLInputElement;
                if (!titleInput.value || !authorInput.value) {
                  return toast.error("Enter Title & Author first!");
                }
                setAiGenerating(true);
                try {
                  const payload = {
                    title: titleInput.value,
                    author: authorInput.value
                  };
                  
                  let response = await fetch('/api/generate-cover', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  
                  let blob;
                  
                  if (!response.ok) {
                    console.warn("OpenAI generation failed or no API key, falling back to abstract procedural cover.");
                    // Fallback to Dicebear abstract shapes
                    const fallbackUrl = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(titleInput.value + authorInput.value)}`;
                    response = await fetch(fallbackUrl);
                    if (!response.ok) throw new Error("Fallback also failed");
                    blob = await response.blob();
                    const file = new File([blob], `cover-${uniqid()}.svg`, { type: 'image/svg+xml' });
                    
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    setValue('image', dataTransfer.files);
                    setAiPreview(URL.createObjectURL(blob));
                    toast.success("Generated Abstract Cover (AI Unavailable)");
                  } else {
                    const data = await response.json();
                    const imageUrl = data.url;
                    
                    // Fetch the image from OpenAI's URL to create a File
                    const imgRes = await fetch(imageUrl);
                    blob = await imgRes.blob();
                    
                    const file = new File([blob], `dalle-cover-${uniqid()}.png`, { type: 'image/png' });
                    
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    setValue('image', dataTransfer.files);
                    setAiPreview(URL.createObjectURL(blob));
                    toast.success("DALL-E Cover Generated!");
                  }
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to generate Cover");
                } finally {
                  setAiGenerating(false);
                }
              }}
              disabled={aiGenerating || isLoading}
              className="text-orange-500 text-sm hover:underline"
            >
              {aiGenerating ? "Generating..." : "✨ Generate AI Cover"}
            </button>
          </div>
          <Input
            id="image"
            type="file"
            disabled={isLoading || aiGenerating}
            accept="image/*"
            {...register("image", { 
              onChange: (e) => {
                if (e.target.files && e.target.files[0]) {
                  setAiPreview(URL.createObjectURL(e.target.files[0]));
                }
              }
            })}
          />
          {aiPreview && (
            <div className="mt-4 flex justify-center">
              <img src={aiPreview} alt="Cover Preview" className="w-32 h-32 object-cover rounded-md shadow-md" />
            </div>
          )}
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
