"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCheck, ShoppingBag, Package, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatConversation } from "@/types/chat";

export function AdminMessagesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("conv");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchConversations = useCallback(async () => {
    const { data } = await supabase.from("conversations").select("*").order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setConversations(data as ChatConversation[]);
    setLoading(false);
  }, [supabase]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", convId).eq("sender_type", "customer").is("read_at", null);
  }, [supabase]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (selectedId) fetchMessages(selectedId); else setMessages([]); }, [selectedId, fetchMessages]);

  useEffect(() => {
    const channel = supabase.channel("admin-conversations").on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchConversations]);

  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase.channel(`admin-messages:${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        setConversations((prev) => prev.map((c) => c.id === selectedId ? { ...c, last_message: msg.content, last_message_at: msg.created_at } : c));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, selectedId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedId || sending) return;
    setSending(true);
    const text = inputValue.trim(); setInputValue("");
    const optimistic: ChatMessage = { id: `opt-${Date.now()}`, conversation_id: selectedId, sender_type: "admin", sender_id: null, content: text, created_at: new Date().toISOString(), read_at: null };
    setMessages((prev) => [...prev, optimistic]);
    const { error } = await supabase.from("messages").insert({ conversation_id: selectedId, sender_type: "admin", sender_id: null, content: text });
    if (error) setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    await supabase.from("conversations").update({ last_message: text, last_message_at: new Date().toISOString() }).eq("id", selectedId);
    setSending(false);
  };

  const closeConversation = async (convId: string) => {
    await supabase.from("conversations").update({ status: "closed" }).eq("id", convId);
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, status: "closed" } : c)));
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-brand-gray-400" strokeWidth={1.5} /></div>;

  return (
    <div className="bg-white border border-brand-gray-200 flex h-[calc(100dvh-8rem)] overflow-hidden">
      <div className={cn("w-full md:w-72 lg:w-80 border-r border-brand-gray-100 flex flex-col shrink-0", selectedId ? "hidden md:flex" : "flex")}>
        <div className="px-4 py-3.5 border-b border-brand-gray-100">
          <h2 className="font-display font-semibold text-base text-brand-black">Conversations<span className="ml-2 text-xs font-normal text-brand-gray-500">({conversations.filter((c) => c.status === "open").length} open)</span></h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="px-4 py-12 text-center"><ShoppingBag size={28} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-2" /><p className="text-sm text-brand-gray-400">No conversations yet</p></div>
          ) : conversations.map((conv) => (
            <button key={conv.id} onClick={() => router.push(`/admin/messages?conv=${conv.id}`, { scroll: false })}
              className={cn("w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-brand-gray-50", selectedId === conv.id ? "bg-brand-black text-white" : "hover:bg-brand-gray-50")}>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", selectedId === conv.id ? "bg-white/10 text-white" : "bg-brand-gray-100 text-brand-gray-600")}>{conv.customer_name[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={cn("text-sm font-medium truncate", selectedId === conv.id ? "text-white" : "text-brand-black")}>{conv.customer_name}</p>
                  <Circle size={6} className={cn("fill-current shrink-0", conv.status === "open" ? "text-green-400" : "text-brand-gray-300")} />
                </div>
                {conv.product_name && <p className={cn("text-[10px] font-medium mt-0.5 flex items-center gap-1 truncate", selectedId === conv.id ? "text-white/60" : "text-brand-accent")}><Package size={9} strokeWidth={1.5} />{conv.product_name}</p>}
                {conv.last_message && <p className={cn("text-xs truncate mt-0.5", selectedId === conv.id ? "text-white/50" : "text-brand-gray-500")}>{conv.last_message}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={cn("flex-1 flex flex-col min-w-0", !selectedId ? "hidden md:flex" : "flex")}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <ShoppingBag size={40} strokeWidth={1} className="text-brand-gray-200" />
            <p className="font-display font-semibold text-lg text-brand-gray-400">Select a conversation</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-gray-100 shrink-0">
              <div><p className="font-semibold text-sm text-brand-black">{selectedConv?.customer_name}</p>{selectedConv?.product_name && <p className="text-xs text-brand-gray-500 flex items-center gap-1 mt-0.5"><Package size={11} strokeWidth={1.5} />Asking about: {selectedConv.product_name}</p>}</div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[10px] font-semibold tracking-widest uppercase px-2 py-1", selectedConv?.status === "open" ? "bg-green-50 text-green-700 border border-green-200" : "bg-brand-gray-100 text-brand-gray-500")}>{selectedConv?.status}</span>
                {selectedConv?.status === "open" && <button onClick={() => closeConversation(selectedId)} className="text-[10px] font-medium text-brand-gray-500 hover:text-brand-black underline underline-offset-2">Close Chat</button>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isAdmin = msg.sender_type === "admin";
                  const isOpt = msg.id.startsWith("opt-");
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn("flex items-end gap-2", isAdmin && "flex-row-reverse")}>
                      {!isAdmin && <div className="w-7 h-7 bg-brand-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-brand-gray-600 shrink-0 mb-0.5">{selectedConv?.customer_name[0].toUpperCase()}</div>}
                      <div className={cn("px-4 py-2.5 max-w-[70%]", isAdmin ? "bg-brand-black text-white" : "bg-brand-gray-100 text-brand-black", isOpt && "opacity-70")}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={cn("flex items-center gap-1 mt-1", isAdmin ? "justify-end" : "justify-start")}>
                          <p className={cn("text-[10px]", isAdmin ? "text-white/40" : "text-brand-gray-400")}>{isOpt ? "Sending…" : new Date(msg.created_at).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</p>
                          {isAdmin && !isOpt && <CheckCheck size={10} strokeWidth={1.5} className="text-white/40" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendReply} className="flex items-center gap-2 px-4 py-3.5 border-t border-brand-gray-100 shrink-0">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={selectedConv?.status === "closed" ? "This conversation is closed" : "Type a reply…"} disabled={sending || selectedConv?.status === "closed"} autoFocus
                className="flex-1 bg-brand-gray-50 border border-transparent focus:border-brand-gray-200 px-4 py-2.5 text-sm text-brand-black placeholder:text-brand-gray-400 outline-none transition-colors disabled:opacity-50" />
              <button type="submit" disabled={!inputValue.trim() || sending || selectedConv?.status === "closed"}
                className={cn("w-10 h-10 flex items-center justify-center transition-all shrink-0", inputValue.trim() && !sending ? "bg-brand-black text-white hover:bg-brand-gray-800" : "bg-brand-gray-100 text-brand-gray-300 cursor-not-allowed")} aria-label="Send">
                {sending ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} /> : <Send size={14} strokeWidth={1.5} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
