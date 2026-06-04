import { createClient } from "@/lib/supabase/client";
import { SHIPPING_FEES } from "@/constants";
import type { CartItem } from "@/types";
import type { CheckoutFormValues } from "@/lib/validations/checkout.schema";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SSM-${ts}-${random}`;
}

export interface CreateOrderPayload {
  formData: CheckoutFormValues;
  items: CartItem[];
  userId: string | null;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

export async function createOrder({ formData, items, userId }: CreateOrderPayload): Promise<CreateOrderResult> {
  const supabase = createClient();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingFee = SHIPPING_FEES[formData.area] ?? 130;
  const freeShipping = subtotal >= 1500;
  const finalShipping = freeShipping ? 0 : shippingFee;
  const total = subtotal + finalShipping;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      subtotal,
      shipping_fee: finalShipping,
      total,
      customer_name: formData.full_name,
      customer_phone: formData.phone,
      shipping_address: { line1: formData.address, area: formData.area, notes: formData.notes ?? "" },
      payment_method: "cod",
      notes: formData.notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) return { success: false, error: orderError?.message ?? "Failed to create order" };

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.images[0]?.url ?? "",
    variant_id: item.variant.id,
    size: item.variant.size,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: "Failed to save order items. Please try again." };
  }

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .single();
  if (error || !data) return null;
  return data;
}
