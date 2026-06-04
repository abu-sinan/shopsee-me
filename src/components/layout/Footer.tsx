import Link         from "next/link";
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { SITE_CONFIG } from "@/constants";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

const footerLinks = {
  Collections: [
    { label: "Men",         href: "/men"         },
    { label: "Women",       href: "/women"       },
    { label: "Kids",        href: "/kids"        },
    { label: "Accessories", href: "/accessories" },
    { label: "New Arrivals",href: "/new"         },
    { label: "Sale",        href: "/sale"        },
  ],
  Support: [
    { label: "FAQ",             href: "/faq"      },
    { label: "Order Tracking",  href: "/track"   },
    { label: "Shipping Policy", href: "/shipping"},
    { label: "Returns",         href: "/returns" },
    { label: "Contact Us",      href: "/contact" },
  ],
  Company: [
    { label: "About Us",         href: "/about"          },
    { label: "Sustainability",   href: "/sustainability"  },
    { label: "Privacy Policy",   href: "/privacy"        },
    { label: "Terms of Service", href: "/terms"          },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-brand-white/80">

      {/* Main grid */}
      <div className="container-brand py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="space-y-7">
            <div>
              <Link href="/" className="font-display font-light text-3xl text-white hover:opacity-70 transition-opacity block mb-3">
                {SITE_CONFIG.name}
              </Link>
              <p className="text-sm text-brand-white/50 leading-relaxed max-w-xs">
                Premium fashion for everyday confidence. Minimal, elegant, and made for Bangladesh.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <p className="label-xs text-brand-white/40 mb-3">Stay in the loop</p>
              <NewsletterForm variant="dark" />
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-white/10 flex items-center justify-center text-brand-white/50 hover:text-white hover:border-brand-white/30 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-white/10 flex items-center justify-center text-brand-white/50 hover:text-white hover:border-brand-white/30 transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon size={14} />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-1.5 text-xs text-brand-white/40 hover:text-white transition-colors ml-2"
              >
                {SITE_CONFIG.email}
                <ArrowUpRight size={11} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p className="label-xs text-brand-white/30 mb-6">{heading}</p>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-white/50 hover:text-white transition-colors link-hover"
                    >
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
      <div className="border-t border-brand-white/5">
        <div className="container-brand py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-white/25">
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {["COD", "bKash", "Nagad"].map((m) => (
              <span key={m} className="text-[10px] font-medium px-2.5 py-1 border border-brand-white/10 text-brand-white/25 rounded-sm tracking-wider">
                {m}
              </span>
            ))}
          </div>
          <p className="text-xs text-brand-white/20">
            {SITE_CONFIG.phone}
          </p>
        </div>
      </div>
    </footer>
  );
}
