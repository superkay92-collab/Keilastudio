"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import clsx from "clsx";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Wigs", href: "/shop?category=wigs" },
  { label: "Bundles", href: "/shop?category=bundles" },
  { label: "Extensions", href: "/shop?category=extensions" },
  { label: "Closures", href: "/shop?category=closures" },
  { label: "Nails", href: "/shop?category=nails" },
  { label: "Hair Care", href: "/shop?category=hair-care" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("keila_admin") === "true");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-cream"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="select-none flex-shrink-0">
            {logoFailed ? (
              <span className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-charcoal italic font-serif">Keila&apos;s Studio</span>
                <span className="text-[10px] tracking-[0.25em] text-muted uppercase">Extension &middot; Accra</span>
              </span>
            ) : (
              <Image
                src="/logo.png"
                alt="Keila's Studio Extensions"
                width={80}
                height={48}
                className="h-12 w-auto object-contain"
                priority
                onError={() => setLogoFailed(true)}
              />
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm tracking-wide transition-colors hover:text-gold",
                  pathname === link.href
                    ? "text-charcoal font-medium"
                    : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-semibold tracking-wide bg-charcoal text-cream px-3 py-1.5 hover:bg-charcoal/80 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency toggle */}
            <div className="hidden sm:flex items-center text-xs border border-cream-dark rounded-sm px-2 py-1 gap-1">
              <button
                onClick={() => setCurrency("GHS")}
                className={clsx(
                  "px-1 transition-colors",
                  currency === "GHS"
                    ? "text-charcoal font-semibold"
                    : "text-muted"
                )}
              >
                GH₵
              </button>
              <span className="text-muted">/</span>
              <button
                onClick={() => setCurrency("USD")}
                className={clsx(
                  "px-1 transition-colors",
                  currency === "USD"
                    ? "text-charcoal font-semibold"
                    : "text-muted"
                )}
              >
                $
              </button>
            </div>

            {/* Track order */}
            <Link
              href="/track"
              className="hidden sm:block text-xs text-muted hover:text-charcoal transition-colors tracking-wide"
            >
              Track
            </Link>

            {/* Account */}
            <Link
              href="/account"
              aria-label="My Account"
              className="text-charcoal hover:text-gold transition-colors"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open cart"
              className="relative text-charcoal hover:text-gold transition-colors"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-charcoal text-cream text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp */}
            <a
              href="https://wa.me/233000000000?text=Hello%20Keila's%20Studio%20Extension!"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-medium px-3 py-1.5 rounded-sm hover:bg-[#1ebe5d] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream border-t border-cream-dark">
          <div className="px-4 py-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-charcoal py-3 border-b border-cream-dark last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-charcoal py-3 border-b border-cream-dark"
            >
              Track Order
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-cream bg-charcoal px-3 py-3 mt-2 text-center"
              >
                Admin Dashboard
              </Link>
            )}
            {/* WhatsApp mobile */}
            <a
              href="https://wa.me/233000000000?text=Hello%20Keila's%20Studio%20Extension!"
            >
              WhatsApp Us
            </a>

            {/* Currency mobile */}
            <div className="flex items-center gap-2 pt-4">
              <span className="text-xs text-muted">Currency:</span>
              {(["GHS", "USD"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={clsx(
                    "text-xs px-3 py-1 border rounded-sm transition-colors",
                    currency === c
                      ? "bg-charcoal text-cream border-charcoal"
                      : "text-muted border-cream-dark"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
