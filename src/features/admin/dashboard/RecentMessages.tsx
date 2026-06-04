import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conv { id: string; customer_name: string; product_name: string | null; last_message: string | null; last_message_at: string | null; status: string; }

export function RecentMessages({ conversations }: { conversations: Conv[] }) {
  return (
    <div className="bg-white border border-brand-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100">
        <h2 className="font-display font-semibold text-base text-brand-black">Open Chats</h2>
        <Link href="/admin/messages" className="flex items-center gap-1 text-xs text-brand-gray-500 hover:text-brand-black">View all <ArrowRight size={11} strokeWidth={1.5} /></Link>
      </div>
      <div className="divide-y divide-brand-gray-50">
        {conversations.length === 0 ? (
          <div className="px-5 py-10 text-center"><MessageCircle size={28} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-2" /><p className="text-sm text-brand-gray-400">No open conversations</p></div>
        ) : conversations.map((conv) => (
          <Link key={conv.id} href={`/admin/messages?conv=${conv.id}`} className="flex items-start gap-3 px-5 py-4 hover:bg-brand-gray-50 transition-colors">
            <div className="w-8 h-8 bg-brand-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-brand-gray-600">{conv.customer_name[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-brand-black truncate">{conv.customer_name}</p>
                {conv.last_message_at && <span className="text-[10px] text-brand-gray-400 shrink-0">{new Date(conv.last_message_at).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
              {conv.product_name && <p className="text-[10px] text-brand-accent font-medium mt-0.5">Re: {conv.product_name}</p>}
              {conv.last_message && <p className="text-xs text-brand-gray-500 truncate mt-0.5">{conv.last_message}</p>}
            </div>
            <span className={cn("shrink-0 w-2 h-2 rounded-full mt-1.5", conv.status === "open" ? "bg-green-400" : "bg-brand-gray-300")} />
          </Link>
        ))}
      </div>
    </div>
  );
}
