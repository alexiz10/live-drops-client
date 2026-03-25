import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Auction</h1>
      <p className="text-gray-600">
        You are successfully connected to the client!
      </p>
    </div>
  )
}
