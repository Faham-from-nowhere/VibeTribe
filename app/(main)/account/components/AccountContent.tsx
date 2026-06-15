"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/libs/helpers";
import Button from "@/components/Button";
import { FaUserCircle } from "react-icons/fa";

const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);

    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link"
      });
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-7 px-6">
      <div className="flex flex-col md:flex-row items-center gap-x-6 bg-neutral-800/50 p-6 rounded-lg mb-8">
        <div className="flex items-center justify-center h-32 w-32 bg-neutral-800 rounded-full drop-shadow-md">
          {userDetails?.avatar_url ? (
            <img
              src={userDetails.avatar_url}
              alt="Avatar"
              className="object-cover h-full w-full rounded-full"
            />
          ) : (
            <FaUserCircle size={80} className="text-neutral-500" />
          )}
        </div>
        <div className="flex flex-col gap-y-2 mt-4 md:mt-0 items-center md:items-start">
          <p className="hidden md:block font-semibold text-sm text-neutral-400">Profile</p>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
            {userDetails?.full_name || userDetails?.first_name || "User"}
          </h1>
          <p className="text-neutral-400 text-lg">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="bg-neutral-800/50 p-6 rounded-lg flex flex-col gap-y-4">
        <h2 className="text-xl font-semibold text-white">Subscription Plan</h2>
        {!subscription ? (
          <div className="flex flex-col gap-y-4">
            <p className="text-neutral-400">You are currently on the free plan.</p>
            <Button className="w-[300px]" onClick={subscribeModal.onOpen}>
              Subscribe to Premium
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <p className="text-neutral-400">
              You are currently on the{" "}
              <b className="text-white text-lg">{subscription?.prices?.products?.name}</b> plan.
            </p>
            <Button
              className="w-[300px] bg-white text-black"
              disabled={loading || isLoading}
              onClick={redirectToCustomerPortal}
            >
              Open Customer Portal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountContent;
