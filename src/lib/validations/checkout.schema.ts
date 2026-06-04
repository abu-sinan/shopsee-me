import { z } from "zod";
import { DELIVERY_AREAS } from "@/constants";

export const checkoutSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .regex(/^(?:\+880|880|0)?1[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  address: z
    .string()
    .min(10, "Please enter your full address")
    .max(250, "Address is too long"),
  area: z.enum(DELIVERY_AREAS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a delivery area" }),
  }),
  notes: z.string().max(300).optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
