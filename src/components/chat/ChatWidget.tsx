"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import {
  MessageCircle, X, Send, Loader2, ShoppingBag, ChevronDown,
} from "lucide-react";
import { cn }            from "@/lib/utils";
import { useChat }       from "@/hooks/useChat";
import { useAuth }       from "@/hooks/useAuth";
import { useChatStore }  from "@/store/chat.store";
import { SITE_CONFIG }   from "@/constants";
import type { ChatMessage } from "@/types/chat";

export function ChatWidget() {
  const { isOpen: storeOpen, openChat, closeChat, productId, productName } = useChatStore();

  const [inputValue, setInputValue]   = useState("");
  const [guestName, setGuestName]     = useState("");
  const [nameSubmitted, setNameSub]   = useState(false);
  const [unreadCount, setUnread]      = useState(0);
  const [localOpen, setLocalOpen]     = useState(false);
  const messagesEndRef                = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  const { user, profile } = useAuth();
  const customerName = (profile?.full_name ?? guestName) || "Guest";

  const { messages, conversation, loading, sending, sendMessage, initConversation } =
    useChat({ customerName, productId, productName, userId: user?.id ?? null });

  // Sync store open state with local
  const isOpen = storeOpen || localOpen;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setUnread(messages.filter((m) => m.sender_type === "admin" && !m.read_at).length);
    } else {
      setUnread(0);
    }
  }, [messages, isOpen]);

  // Auto-init when opened with product context from store
  useEffect(() => {
    if (storeOpen && (user || nameSubmitted) && !conversation && !loading) {
      initConversation().then(() => {
        if (productName) {
          sendMessage(`Hi! I have a question about "${productName}".`);
        }
      });
    }
  }, [storeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setLocalOpen(false);
    closeChat();
  };

  const handleOpen = useCallback(async () => {
    setLocalOpen(true);
    setUnread(0);
    if (!conversation && nameSubmitted) await initConversation();
  }, [conversation, nameSubmitted, initConversation]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() && !user) return;
    setNameSub(true);
    await initConversation();
    const greeting = productName
      ? `Hi! I have a question about "${productName}".`
      : "Hi! I need some help.";
    await sendMessage(greeting);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage(text);
  };

  const showNameForm    = isOpen && !user && !nameSubmitted && !loading;
  const showChat        = isOpen && (!!user || nameSubmitted) && !loading;
  const showLoadingInit = isOpen && loading;

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92,  y: 16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-[90vw] max-w-sm bg-brand-white border border-brand-gray-200 shadow-2xl flex flex-col overflow-hidden"
            style={{ height: 480 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-brand-black text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-brand-gray-700 rounded-full flex items-center justify-center">
                    <ShoppingBag size={14} strokeWidth={1.5} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-brand-black rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{SITE_CONFIG.name}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    {productName ? `Re: ${productName.slice(0, 30)}` : "Customer Support"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/60 hover:text-white p-1" aria-label="Close">
                <ChevronDown size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Name form */}
            {showNameForm && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
                <div className="w-14 h-14 bg-brand-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={24} strokeWidth={1} className="text-brand-gray-400" />
                </div>
                <h3 className="font-display font-semibold text-brand-black mb-1">Start a Conversation</h3>
                <p className="text-xs text-brand-gray-500 mb-6">
                  {productName ? `Ask us anything about "${productName}"` : "Our team replies within minutes."}
                </p>
                <form onSubmit={handleNameSubmit} className="w-full space-y-3">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 text-sm border border-brand-gray-200 outline-none focus:border-brand-gray-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!guestName.trim()}
                    className="w-full btn-primary py-2.5 text-xs justify-center disabled:opacity-40"
                  >
                    Start Chat
                  </button>
                </form>
              </div>
            )}

            {/* Loading */}
            {showLoadingInit && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-brand-gray-400" strokeWidth={1.5} />
              </div>
            )}

            {/* Messages */}
            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
                  {/* Welcome */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-brand-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag size={12} strokeWidth={1.5} className="text-white" />
                    </div>
                    <div className="bg-brand-gray-100 px-3.5 py-2.5 max-w-[80%]">
                      <p className="text-sm text-brand-black leading-relaxed">
                        Hi {customerName.split(" ")[0]}! 👋 Welcome to {SITE_CONFIG.name}.
                        {productName ? ` Ask me anything about "${productName}".` : " How can we help you today?"}
                      </p>
                      <p className="text-[10px] text-brand-gray-400 mt-1">{SITE_CONFIG.name} Team</p>
                    </div>
                  </div>

                  {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 px-3 py-3 border-t border-brand-gray-100 shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message…"
                    disabled={sending}
                    className="flex-1 bg-brand-gray-50 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-gray-400 outline-none border border-transparent focus:border-brand-gray-200 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sending}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center transition-all shrink-0",
                      inputValue.trim() && !sending
                        ? "bg-brand-black text-white hover:bg-brand-gray-800"
                        : "bg-brand-gray-100 text-brand-gray-300 cursor-not-allowed"
                    )}
                    aria-label="Send"
                  >
                    {sending
                      ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} />
                      : <Send    size={14} strokeWidth={1.5} />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={isOpen ? handleClose : handleOpen}
        className="relative w-14 h-14 bg-brand-black text-white rounded-full shadow-lg hover:bg-brand-gray-800 transition-colors flex items-center justify-center"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={20} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isCustomer   = message.sender_type === "customer";
  const isOptimistic = message.id.startsWith("optimistic-");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-end gap-2", isCustomer && "flex-row-reverse")}
    >
      {!isCustomer && (
        <div className="w-6 h-6 bg-brand-black rounded-full flex items-center justify-center shrink-0 mb-0.5">
          <ShoppingBag size={10} strokeWidth={1.5} className="text-white" />
        </div>
      )}
      <div className={cn(
        "px-3.5 py-2.5 max-w-[78%]",
        isCustomer ? "bg-brand-black text-white" : "bg-brand-gray-100 text-brand-black",
        isOptimistic && "opacity-70"
      )}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1",
          isCustomer ? "text-white/50 text-right" : "text-brand-gray-400"
        )}>
          {isOptimistic
            ? "Sending…"
            : new Date(message.created_at).toLocaleTimeString("en-BD", {
                hour: "2-digit", minute: "2-digit",
              })}
        </p>
      </div>
    </motion.div>
  );
}
