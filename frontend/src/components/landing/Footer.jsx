import { useState } from "react";

const NAV_LINKS = [
  {
    heading: "Destinations",
    links: ["Asia", "Europe", "Americas", "Africa", "Oceania"],
  },
  {
    heading: "Travel Guide",
    links: ["Trip Planning", "Packing Tips", "Budget Travel", "Solo Travel"],
  },
  {
    heading: "Experiences",
    links: ["Adventure", "Cultural Tours", "Food & Drink", "Wellness"],
  },
  {
    heading: "Company",
    links: ["About Us", "Contact", "Careers", "Press", "Affiliates"],
  },
];

const SOCIALS = [
  {
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

// Simulated Link component (replaces react-router-dom Link)
function Link({ to, children, className }) {
  return (
    <a href={to} className={className} onClick={(e) => e.preventDefault()}>
      {children}
    </a>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-end font-sans">
      <footer className="bg-neutral-950 text-white pt-16 pb-6 border-t border-white/10">
        {/* Top Banner */}
        <div className="max-w-7xl mx-auto px-6 mb-14">
          <div className="rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-px"></div>
        </div>

        {/* Main Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Travel Guide
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mb-6">
              Your trusted companion for discovering the world. Curated guides,
              insider tips, and unforgettable experiences for every kind of
              traveler.
            </p>
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {["🌍 100+ Countries", "⭐ 4.9 Rated", "✈️ 2M+ Travelers"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="text-xs bg-white/5 border border-white/10 text-neutral-300 px-3 py-1.5 rounded-full"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Nav Columns */}
          {NAV_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Socials */}
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-amber-500 hover:border-amber-500 hover:text-neutral-950 text-neutral-400 flex items-center justify-center transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-5 text-xs text-neutral-500">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Cookie Settings",
              "Sitemap",
            ].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-neutral-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-neutral-600 whitespace-nowrap">
            © {new Date().getFullYear()} Wanderlust. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
