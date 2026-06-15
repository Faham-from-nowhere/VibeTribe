"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import usePlayer from "@/hooks/usePlayer";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import useAIPromptModal from "@/hooks/useAIPromptModal";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";

const AIPromptModal = () => {
  const { isOpen, onClose } = useAIPromptModal();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const player = usePlayer();
  const supabase = createClient();
  const { user, subscription } = useUser();
  const subscribeModal = useSubscribeModal();

  const onChange = (open: boolean) => {
    if (!open) {
      setPrompt("");
      onClose();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!user) {
      return toast.error("You must be logged in to use AI DJ.");
    }

    const hasUltra = subscription?.prices?.products?.name === "VibeTribe Ultra";
    if (user.email !== "mohdfahamb@gmail.com" && !hasUltra) {
      toast.error("AI DJ requires the VibeTribe Ultra plan.");
      onClose();
      subscribeModal.onOpen();
      return;
    }

    try {
      setIsLoading(true);

      // Fetch all songs to pass as context
      const { data: songs, error } = await supabase.from("songs").select("*");
      
      if (error || !songs) {
        throw new Error("Failed to load catalog");
      }

      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          availableSongs: songs
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { songIds } = await response.json();

      if (songIds && songIds.length > 0) {
        toast.success(`AI found ${songIds.length} songs!`);
        // Play the first song and set the rest as the queue
        player.setId(songIds[0]);
        player.setIds(songIds);
        onClose();
      } else {
        toast.error("AI couldn't find any matching songs.");
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to generate AI playlist");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  return (
    <Modal
      title="AI DJ"
      description="Tell the AI what kind of vibe you want, and it will generate a playlist for you."
      isOpen={isOpen}
      onChange={onChange}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. upbeat synthwave for a night drive..."
        />
        <Button disabled={isLoading || !prompt.trim()} type="submit" className="bg-orange-500">
          {isLoading ? "Generating..." : "Generate AI Playlist"}
        </Button>
      </form>
    </Modal>
  );
};

export default AIPromptModal;
