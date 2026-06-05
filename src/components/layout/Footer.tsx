import Link  from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, FacebookIcon }       from "@/components/icons/SocialIcons";
import { NewsletterForm }                    from "@/components/shared/NewsletterForm";
import { SITE_CONFIG }                       from "@/constants";

const links = {
  Shop: [
    { label: "Men",          href: "/men"          },
    { label: "Women",        href: "/women"        },
    { label: "Kids",         href: "/kids"         },
    { label: "Accessories",  href: "/accessories"  },
    { label: "New Arrivals", href: "/new"          },
    { label: "Sale",         href: "/sale"         },
  ],
  Help: [
    { label: "FAQ",            href: "/faq"      },
    { label: "Track Order",    href: "/track"    },
    { label: "Shipping Info",  href: "/shipping" },
    { label: "Returns",        href: "/returns"  },
    { label: "Contact Us",     href: "/contact"  },
  ],
  Company: [
    { label: "About Us",       href: "/about"         },
    { label: "Sustainability",  href: "/sustainability" },
    { label: "Privacy Policy", href: "/privacy"       },
    { label: "Terms",          href: "/terms"         },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70">

      {/* Main content */}
      <div className="container-brand py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="space-y-6">
            <div>
              <Link href="/" className="font-display font-light text-3xl text-white hover:opacity-70 transition-opacity block mb-3">
                {SITE_CONFIG.name}
              </Link>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                Premium fashion for everyday confidence. Minimal, elegant, and crafted for Bangladesh.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              <a href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors group">
                <Mail size={14} strokeWidth={1.5} className="shrink-0" />
                {SITE_CONFIG.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/40">
                <MapPin size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                <span>{SITE_CONFIG.address}</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                aria-label="Instagram">
                <InstagramIcon size={14} />
              </a>
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                aria-label="Facebook">
                <FacebookIcon size={14} />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[10px] font-medium tracking-widest-3 uppercase text-white/30 mb-3">
                Newsletter
              </p>
              <NewsletterForm variant="dark" />
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-[10px] font-semibold tracking-widest-3 uppercase text-white/25 mb-5">
                {heading}
              </p>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-brand py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Designed &amp; built with care in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
