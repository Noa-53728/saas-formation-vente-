"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
};

type ConversationMessagesProps = {
  initialMessages: Message[];
  currentUserId: string;
  courseId: string;
  partnerId: string;
};

export function ConversationMessages({
  initialMessages,
  currentUserId,
  courseId,
  partnerId,
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
      .channel(`messages-${courseId}-${currentUserId}-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          const isInConversation =
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === partnerId) ||
            (newMessage.sender_id === partnerId &&
              newMessage.receiver_id === currentUserId);

          if (!isInConversation) return;

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

