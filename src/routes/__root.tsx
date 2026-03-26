import {Outlet, createRootRoute, useNavigate, Link} from '@tanstack/react-router'
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { useAuthStore } from "../lib/store";

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const navigate = useNavigate();
  const { status, refresh, logout } = useAuthStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLogout = async () => {
    await logout();
    void navigate({ to: "/auth/login" });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col  font-sans text-zinc-900 selection:bg-emerald-200">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 hover:text-zinc-600 transition-colors">
            LIVE<span className="text-emerald-500">DROPS</span>
          </Link>

          <nav className="flex items-center gap-2 md:gap-6">
            {status === "unknown" ? null : status === "authenticated" ? (
              <>
                <Link to="/" className="hidden md:block text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                  Marketplace
                </Link>
                <Link
                  to="/auctions/me"
                  className="hidden md:block text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors cursor-pointer">
                  Sign Out
                </button>
                <Link to="/auctions/create" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-zinc-800 active:scale-95 transition-all shadow-md shadow-black/10">
                  + Sell
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-2">
                  Sign In
                </Link>
                <Link to="/auth/register" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-zinc-800 active:scale-95 transition-all shadow-md shadow-black/10">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="grow w-full">
        {status === "unknown" ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-pulse text-zinc-400 font-bold tracking-widest uppercase text-sm">
              Authenticating...
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}
