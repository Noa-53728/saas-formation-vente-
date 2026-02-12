"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
};

type ConversationMessagesProps = {
  initialMessages: Message[];
  currentUserId: string;
  conversationId: string;
};

export function ConversationMessages({
  initialMessages,
  currentUserId,
  conversationId,
}: ConversationMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    // Réinitialiser les messages si la conversation change (changement de route)
    setMessages(initialMessages ?? []);
  }, [initialMessages]);

  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient();
    }

    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`messages-${conversationId}-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            // éviter les doublons si on reçoit plusieurs fois le même event
            if (prev.some((m) => m.id === newMessage.id)) return prev;

            return [...prev, newMessage].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            );
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, currentUserId, partnerId]);

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
      {messages.length === 0 ? (
        <p className="text-sm text-white/60">
          Aucun message pour l&apos;instant.
        </p>
      ) : (
        messages.map((message) => {
          const isMe = message.sender_id === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm shadow ${
                  isMe
                    ? "bg-accent text-white border-accent/80"
                    : "bg-white/5 border-white/10 text-white"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
                <p className="mt-1 text-[11px] opacity-70">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

