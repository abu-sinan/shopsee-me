import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: "ShopSeeMe",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#0A0A0A",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    categories: ["shopping", "lifestyle"],
  };
}
