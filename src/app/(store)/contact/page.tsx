import type { Metadata } from "next";
import { ContactClient } from "@/features/contact/ContactClient";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_CONFIG.name}. We're here to help.`,
};

export default function ContactPage() { return <ContactClient />; }
