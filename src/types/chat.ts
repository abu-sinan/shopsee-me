export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "admin";
  sender_id: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type ChatConversation = {
  id: string;
  user_id: string | null;
  customer_name: string;
  product_id: string | null;
  product_name: string | null;
  status: "open" | "closed";
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
};
