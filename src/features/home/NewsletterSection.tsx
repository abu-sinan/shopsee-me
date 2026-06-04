"use client";

import { motion } from "framer-motion";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="bg-brand-dark text-brand-white py-20 md:py-28" aria-labelledby="nl-heading">
      <div className="container-brand">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="label-sm text-white/30 mb-4 tracking-widest-4"
          >
            Stay Connected
          </motion.p>

          <motion.h2
            id="nl-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display font-light text-white text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            Be the First to Know
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="mt-5 text-sm text-white/40 leading-relaxed max-w-sm mx-auto"
          >
            New collections, exclusive drops, and style inspiration — delivered directly to your inbox.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28, duration: 0.6 }}
            className="mt-8 max-w-sm mx-auto"
          >
            <NewsletterForm variant="dark" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-[10px] text-white/20 tracking-wider"
          >
            No spam, ever. Unsubscribe anytime.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
