"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Settings } from "lucide-react";
import clsx from "clsx";

const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "6607";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (sessionStorage.getItem("keila_admin") === "true") setAuthed(true);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("keila_admin", "true");
      setAuthed(true);
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  function logout() {
    sessionStorage.removeItem("keila_admin");
    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">
              Admin Access
            </p>
            <h1 className="text-2xl font-bold italic font-serif">
              Keila&apos;s Studio
            </h1>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              autoComplete="current-password"
              required
              className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-charcoal text-cream py-4 text-sm font-medium hover:bg-charcoal/90 transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
          <p className="text-xs text-center text-muted mt-6">
            Default password: admin123 — change in{" "}
            <code className="bg-cream-dark px-1 py-0.5">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar */}
      <aside className="w-56 bg-charcoal text-cream flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-cream/10">
          <p className="text-[9px] tracking-[0.2em] uppercase text-cream/40">
            Admin Panel
          </p>
          <p className="font-bold italic font-serif mt-1 text-cream">
            Keila&apos;s Studio
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors",
                pathname === href
                  ? "bg-cream/10 text-cream"
                  : "text-cream/55 hover:text-cream hover:bg-cream/5"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cream/10 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/55 hover:text-cream transition-colors"
          >
            ← View Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/55 hover:text-cream transition-colors w-full"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
