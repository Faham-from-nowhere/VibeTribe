"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

import Modal from "./Modal";
import Button from "./Button";

import { Price, ProductWithPrice } from "@/types";

import { useUser } from "@/hooks/useUser";
import useSubscribeModal from "@/hooks/useSubscribeModal";

import { postData } from "@/libs/helpers";

interface SubscribeModalProps {
  products: ProductWithPrice[];
}

const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0
  }).format((price.unit_amount || 0) / 100);

  return priceString;
};

const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
  const subscribeModal = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const onChange = (open: boolean) => {
    if (!open) subscribeModal.onClose();
  };

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error("Must be Logged In to Subscribe.");
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      return toast("Already Subscribed.");
    }

    try {
      const { sessionUrl } = await postData({
        url: "/api/create-checkout-session",
        data: { price }
      });

      if (sessionUrl) {
        window.location.assign(sessionUrl);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = <div className="text-center">No Products Available.</div>;

  if (products.length) {
    content = (
      <div className="flex flex-col gap-y-6">
        {products.map((product) => {
          if (!product.prices?.length) {
            return null;
          }

          return (
            <div key={product.id} className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 flex flex-col gap-y-3">
              <div className="flex items-center gap-x-4">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md shadow-md" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  <p className="text-sm text-neutral-400 mt-1">{product.description}</p>
                </div>
              </div>
              
              {product.prices.map((price) => (
                <Button
                  key={price.id}
                  onClick={() => handleCheckout(price)}
                  disabled={isLoading || price.id === priceIdLoading}
                  className="mt-2"
                >
                  {`Subscribe for ${formatPrice(price)} / ${price.interval}`}
                </Button>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  if (subscription) {
    content = <div className="text-center">Already Subscribed.</div>;
  }

  return (
    <Modal
      title="Only for premium users"
      description="Listen to Music with VibeTribe Premium."
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;
