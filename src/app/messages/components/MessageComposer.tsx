"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface MessageComposerProps {
  courseId: string;
  receiverId: string;
  placeholder?: string;
}

export function MessageComposer({ courseId, receiverId, placeholder }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!content.trim()) return;

    startTransition(async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ courseId, receiverId, content })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || "Envoi impossible");
        return;
      }

      setContent("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSend} className="space-y-3">
      <textarea
        className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-accent"
        rows={3}
        placeholder={placeholder || "Écrire un message au vendeur..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button className="button-primary w-full" type="submit" disabled={isPending}>
        {isPending ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}

export default MessageComposer;
