import { Outlet, createRootRoute, useNavigate, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { useAuthStore } from "../lib/store";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const { status, refresh, logout } = useAuthStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLogout = async () => {
    await logout();
    void navigate({ to: "/auth/login" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-zinc-900 selection:bg-emerald-200">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tighter text-zinc-900 transition-colors hover:text-zinc-600 md:text-2xl"
          >
            LIVE<span className="text-emerald-500">DROPS</span>
          </Link>

          <nav className="flex items-center gap-2 md:gap-6">
            {status === "unknown" ? null : status === "authenticated" ? (
              <>
                <Link
                  to="/"
                  className="hidden text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900 md:block"
                >
                  Marketplace
                </Link>
                <Link
                  to="/auctions/me"
                  className="hidden text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900 md:block"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden cursor-pointer text-sm font-bold text-zinc-500 transition-colors hover:text-red-500 md:block"
                >
                  Sign Out
                </button>
                <Link
                  to="/auctions/create"
                  className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white shadow-md shadow-black/10 transition-all hover:bg-zinc-800 active:scale-95"
                >
                  + Sell
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white shadow-md shadow-black/10 transition-all hover:bg-zinc-800 active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="w-full grow">
        {status === "unknown" ? (
          <div className="flex h-[70vh] items-center justify-center">
            <div className="animate-pulse text-sm font-bold tracking-widest text-zinc-400 uppercase">
              Authenticating...
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
