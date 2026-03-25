import { Outlet, createRootRoute } from '@tanstack/react-router'
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto font-bold text-xl text-indigo-600">
          Live Auction Platform
        </div>
      </header>

      <main className="grow p-4 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <TanStackRouterDevtools />
    </div>
  ),
})
