"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Replace with real auth (NextAuth, Supabase, Clerk, etc.)
    toast.success(
      mode === "login" ? "Welcome back!" : "Account created successfully!"
    );
    router.push("/track");
  }

  return (
    <div className="pt-28 pb-24 max-w-md mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">
          Account
        </p>
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Full Name"
            required
            className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
          />
        )}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email Address"
          required
          autoComplete="email"
          className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-charcoal text-cream py-4 text-sm font-medium tracking-wide hover:bg-charcoal/90 transition-colors"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-muted text-center mt-6">
        {mode === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
          className="text-charcoal font-medium underline underline-offset-4 hover:text-gold transition-colors"
        >
          {mode === "login" ? "Register" : "Sign In"}
        </button>
      </p>

      <div className="mt-8 p-4 bg-cream-dark text-sm text-muted">
        <p className="font-medium text-charcoal mb-1">No account needed</p>
        <p>
          You can{" "}
          <Link
            href="/track"
            className="underline underline-offset-4 hover:text-gold"
          >
            track your order
          </Link>{" "}
          using your Order ID or email — no login required.
        </p>
      </div>
    </div>
  );
}
