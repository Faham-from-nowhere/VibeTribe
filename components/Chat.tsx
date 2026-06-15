"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "@/hooks/useUser";
import Input from "./Input";
import Button from "./Button";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: { full_name?: string; avatar_url?: string };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUser();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, users(full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setMessages(data.reverse());
      }
    };

    fetchMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = { ...payload.new, users: userData } as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage;
    setNewMessage("");

    await supabase.from("messages").insert({
      user_id: user.id,
      content: messageContent,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 rounded-lg p-4">
      <h2 className="text-white font-semibold text-lg mb-4 border-b border-neutral-800 pb-2">
        Friend Activity
      </h2>

      <div className="flex-1 overflow-y-auto flex flex-col gap-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center mt-4">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-y-1">
              <span className="text-neutral-400 text-[11px] font-semibold">
                {msg.users?.full_name || "Anonymous User"}
              </span>
              <div className="bg-neutral-800/80 rounded-md p-2 text-sm text-neutral-200 break-words">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-x-2 mt-auto">
        <Input
          disabled={!user}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={user ? "Type a message..." : "Log in to chat"}
          className="text-sm px-3 py-2 bg-neutral-800 border-transparent focus:border-transparent focus:outline-none focus:ring-0"
        />
        <Button
          disabled={!user || !newMessage.trim()}
          type="submit"
          className="w-auto px-4 py-2"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
