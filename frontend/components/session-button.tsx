"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionResponse = {
  loggedIn: boolean;
  user: {
    name: string;
    email: string;
  } | null;
};

export default function SessionButton() {
  const [session, setSession] = useState<SessionResponse>({ loggedIn: false, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = (await response.json()) as SessionResponse;
        if (active) {
          setSession(payload);
        }
      } catch {
        if (active) {
          setSession({ loggedIn: false, user: null });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setSession({ loggedIn: false, user: null });
    }
  }

  if (loading) {
    return (
      <div className="glass-pill text-xs text-slate-600">
        Session...
      </div>
    );
  }

  if (!session.loggedIn || !session.user) {
    return (
      <Link
        href="/login"
        className="glass-button inline-flex items-center justify-center rounded-full border border-emerald-200/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(236,253,245,0.78)_100%)] px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-[0_10px_22px_rgba(16,185,129,0.12)] transition hover:border-emerald-300/70"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="glass-pill text-xs text-slate-700">Hi, {session.user.name}</span>
      <button
        type="button"
        onClick={logout}
        className="glass-button inline-flex items-center justify-center rounded-full border border-rose-200/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(255,241,242,0.78)_100%)] px-3.5 py-2 text-xs font-semibold text-rose-900 shadow-[0_10px_22px_rgba(244,63,94,0.12)] transition hover:border-rose-300/70"
      >
        Logout
      </button>
    </div>
  );
}
