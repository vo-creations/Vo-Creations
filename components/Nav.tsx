"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/about", label: "For Brands" },
  { href: "/mentorship", label: "For Creators" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-4 flex justify-between items-center bg-bg/80 backdrop-blur-[20px] border-b border-border">
      <Link href="/" className="text-lg font-extrabold tracking-tight text-text">
        Vo <span className="text-accent">Creations</span>
      </Link>

      <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
              pathname === link.href
                ? "text-accent"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <a
        href="https://calendar.app.google/BMAP5qH6Qwtkm5Yr5"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-accent text-bg font-bold text-[13px] px-6 py-2.5 rounded-full hover:shadow-[0_0_24px_rgba(245,166,35,0.3)] hover:-translate-y-px transition-all"
      >
        Apply for a slot
      </a>
    </nav>
  );
}
