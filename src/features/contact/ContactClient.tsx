"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/constants";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

const FAQ = [
  { q: "How long does delivery take?", a: "Dhaka City: 1-2 business days. Outside Dhaka: 2-4 business days." },
  { q: "Can I return a product?", a: "Yes. We accept returns within 7 days of delivery for unworn, original-condition items." },
  { q: "Do you offer Cash on Delivery?", a: "Yes! COD is available across Bangladesh. bKash and Nagad coming soon." },
  { q: "How do I track my order?", a: "Visit our Order Tracking page and enter your order number (starts with SSM-)." },
];

export function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormValues) => {
    setServerError(null);
    const supabase = createClient();
    const { data: conv, error } = await supabase.from("conversations").insert({ customer_name: data.name, customer_email: data.email, customer_phone: data.phone ?? null, status: "open" }).select().single();
    if (error || !conv) { setServerError("Failed to send message. Please try again."); return; }
    await supabase.from("messages").insert({ conversation_id: conv.id, sender_type: "customer", content: `[${data.subject}]

${data.message}` });
    setSubmitted(true);
  };

  return (
    <div className="py-12 md:py-20">
      <div className="container-brand max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="label-caps mb-3">Get In Touch</p>
          <h1 className="heading-lg text-brand-black mb-4">Contact Us</h1>
          <p className="body-md text-brand-gray-500 max-w-md mx-auto">We typically respond within a few hours.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14">
          <div>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-4 text-center py-20 border border-brand-gray-200 bg-brand-gray-50">
                <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center"><CheckCircle2 size={28} strokeWidth={1.5} className="text-green-600" /></div>
                <div><h2 className="font-display font-semibold text-xl text-brand-black mb-2">Message Sent!</h2><p className="text-sm text-brand-gray-500">We&apos;ll get back to you within a few hours.</p></div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {serverError && <p className="p-4 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CField label="Your Name *" error={errors.name?.message}><input {...register("name")} type="text" placeholder="Rahim Uddin" autoComplete="name" className={ci(!!errors.name)} /></CField>
                  <CField label="Email Address *" error={errors.email?.message}><input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={ci(!!errors.email)} /></CField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CField label="Phone (optional)" error={errors.phone?.message}><input {...register("phone")} type="tel" placeholder="01712345678" className={ci(false)} /></CField>
                  <CField label="Subject *" error={errors.subject?.message}><input {...register("subject")} type="text" placeholder="e.g. Order issue, Product query" className={ci(!!errors.subject)} /></CField>
                </div>
                <CField label="Message *" error={errors.message?.message}><textarea {...register("message")} rows={5} placeholder="Tell us how we can help…" className={cn(ci(!!errors.message), "resize-none")} /></CField>
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-4 disabled:opacity-60">
                  {isSubmitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</span> : "Send Message"}
                </button>
              </form>
            )}
          </div>
          <div className="space-y-8">
            <div className="bg-brand-black text-white p-8">
              <h2 className="font-display font-semibold text-xl mb-6">Contact Info</h2>
              <div className="space-y-5">
                {[{ icon: Phone, label: "Phone", value: SITE_CONFIG.phone, href: `tel:${SITE_CONFIG.phone}` }, { icon: Mail, label: "Email", value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` }, { icon: MapPin, label: "Address", value: SITE_CONFIG.address, href: "#" }].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors"><Icon size={14} strokeWidth={1.5} /></div>
                    <div><p className="text-[10px] text-white/40 tracking-widest uppercase mb-0.5">{label}</p><p className="text-sm text-white group-hover:opacity-80">{value}</p></div>
                  </a>
                ))}
              </div>
              <div className="mt-7 pt-7 border-t border-white/10">
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Business Hours</p>
                <p className="text-sm text-white/70">Sunday – Thursday: 10am – 8pm</p>
                <p className="text-sm text-white/70">Friday: 2pm – 8pm</p>
                <p className="text-sm text-white/50">Saturday: Closed</p>
              </div>
              <div className="mt-7 pt-7 border-t border-white/10 flex items-center gap-4">
                <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"><InstagramIcon size={15} />Instagram</a>
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"><FacebookIcon size={15} />Facebook</a>
              </div>
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl text-brand-black mb-5">Frequently Asked</h2>
              <div className="space-y-1">
                {FAQ.map((item, i) => (
                  <div key={i} className="border border-brand-gray-100 bg-white">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left" aria-expanded={openFaq === i}>
                      <span className="text-sm font-medium text-brand-black">{item.q}</span>
                      <span className={cn("text-xl font-light text-brand-gray-400 transition-transform duration-200 shrink-0", openFaq === i && "rotate-45")}>+</span>
                    </button>
                    <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-brand-gray-500 leading-relaxed">{item.a}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-gray-700 mb-1.5 tracking-wide">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
function ci(hasError: boolean) {
  return cn("w-full px-4 py-3 text-sm text-brand-black bg-white border outline-none transition-colors placeholder:text-brand-gray-300", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-500");
}
