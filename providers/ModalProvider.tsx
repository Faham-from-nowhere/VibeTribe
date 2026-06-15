"use client";

import AuthModal from "@/components/AuthModal";
import SubscribeModal from "@/components/SubscribeModal";
import UploadModal from "@/components/UploadModal";
import AIPromptModal from "@/components/AIPromptModal";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";

import { ProductWithPrice } from "@/types";

import React, { useEffect, useState } from "react";

interface ModalProviderProps {
  products: ProductWithPrice[];
}

const ModalProvider: React.FC<ModalProviderProps> = ({ products }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <AuthModal />
      <UploadModal />
      <AIPromptModal />
      <SubscribeModal products={products} />
      <CreatePlaylistModal />
      <AddToPlaylistModal />
    </>
  );
};

export default ModalProvider;
