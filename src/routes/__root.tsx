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
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-bold text-xl text-indigo-600">
            Live Auction Platform
          </Link>

          <nav className="space-x-4">
            {status === "authenticated" ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/auctions/create" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Create Auction
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 font-medium cursor-pointer">
                  Sign Out
                </button>
              </>
            ) : null}

            {status === "unauthenticated" ? (
              <>
                <Link to="/auth/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Sign In
                </Link>
                <Link to="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                  Sign Up
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="grow p-4 max-w-7xl mx-auto w-full">
        {status === "unknown" ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400 font-medium">Loading session...</div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <TanStackRouterDevtools />
    </div>
  )
}
