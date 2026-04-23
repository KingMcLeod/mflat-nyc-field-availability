import { useState } from "react"
import SearchForm from "./components/SearchForm"
import AvailabilityCalendar from "./components/AvailabilityCalendar"

const API_BASE = import.meta.env.VITE_API_BASE

export default function App() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSearch({ sport, start, end }) {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const params = new URLSearchParams({ sport, start, end })
      const resp = await fetch(`${API_BASE}/api/availability?${params}`)

      if (!resp.ok) throw new Error("Failed to fetch")

      const json = await resp.json()
      setData(json)
    } catch (err) {
      setError("Something went wrong while fetching availability. Please try again in a moment — if the issue continues, NYC Parks may be temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header / Search */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center mt-16 gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Fetching availability from NYC Parks...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mx-4 sm:mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {data && !loading && <AvailabilityCalendar data={data} />}

    </div>
  )
}