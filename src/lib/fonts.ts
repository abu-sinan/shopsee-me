import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Mono,
} from "next/font/google";

// Editorial serif — headlines, hero text
export const cormorant = Cormorant_Garamond({
  subsets:  ["latin"],
  variable: "--font-cormorant",
  display:  "swap",
  weight:   ["300", "400", "500", "600", "700"],
  style:    ["normal", "italic"],
});

// Body & UI — clean geometric sans
export const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-dm-sans",
  display:  "swap",
  weight:   ["300", "400", "500", "600"],
});

// Mono — order numbers, codes
export const dmMono = DM_Mono({
  subsets:  ["latin"],
  variable: "--font-dm-mono",
  display:  "swap",
  weight:   ["300", "400", "500"],
});
