"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatConversation } from "@/types/chat";

interface UseChatOptions {
  customerName: string;
  productId?:   string;
  productName?: string;
  userId?:      string | null;
}

export function useChat({
  customerName,
  productId,
  productName,
  userId,
}: UseChatOptions) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [loading, setLoading]           = useState(false);
  const [sending, setSending]           = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const initRef    = useRef(false);

  // Use a stable client reference
  const supabaseRef = useRef(createClient());
  const supabase    = supabaseRef.current;

  const initConversation = useCallback(async () => {
    // Prevent duplicate calls
    if (initRef.current || conversation) return;
    initRef.current = true;
    setLoading(true);

    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({
        user_id:       userId ?? null,
        customer_name: customerName || "Guest",
        product_id:    productId    ?? null,
        product_name:  productName  ?? null,
        status:        "open",
      })
      .select()
      .single();

    if (error || !conv) {
      console.error("Failed to create conversation:", error);
      initRef.current = false;
      setLoading(false);
      return;
    }

    setConversation(conv as ChatConversation);

    // Load existing messages
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    if (msgs) setMessages(msgs as ChatMessage[]);

    // Subscribe to realtime
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`chat:${conv.id}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "messages",
          filter: `conversation_id=eq.${conv.id}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    setLoading(false);
  }, [supabase, customerName, productId, productName, userId, conversation]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation || !content.trim()) return;
      setSending(true);

      // Optimistic update
      const optimisticId = `optimistic-${Date.now()}`;
      const optimistic: ChatMessage = {
        id:              optimisticId,
        conversation_id: conversation.id,
        sender_type:     "customer",
        sender_id:       userId ?? null,
        content:         content.trim(),
        created_at:      new Date().toISOString(),
        read_at:         null,
      };
      setMessages((prev) => [...prev, optimistic]);

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_type:     "customer",
        sender_id:       userId ?? null,
        content:         content.trim(),
      });

      if (error) {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }

      // Update last message
      await supabase
        .from("conversations")
        .update({
          last_message:    content.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);

      setSending(false);
    },
    [conversation, supabase, userId]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase]);

  return { messages, conversation, loading, sending, sendMessage, initConversation };
}
