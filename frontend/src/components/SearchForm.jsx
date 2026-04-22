const SPORTS = [
  { value: "soccer",     label: "Soccer" },
  { value: "baseball",   label: "Baseball" },
  { value: "basketball", label: "Basketball" },
  { value: "football",   label: "Football" },
  { value: "softball",   label: "Softball" },
  { value: "handball",   label: "Handball" },
  { value: "volleyball", label: "Volleyball" },
  { value: "cricket",    label: "Cricket" },
  { value: "hockey",     label: "Hockey" },
  { value: "tennis",     label: "Tennis" },
  { value: "all",        label: "All Sports" },
]

const today = new Date().toISOString().split("T")[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]

export default function SearchForm({ onSearch, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    onSearch({
      sport: form.sport.value,
      start: form.start.value,
      end:   form.end.value,
    })
  }

  return (
    <div className="bg-[#1e3a5f] px-4 py-5 sm:px-8 sm:py-6">

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-white text-xl sm:text-2xl font-bold">
          NYC Parks Field Availability
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
          Search available fields across any date range — data pulled live from NYC Parks
        </p>
      </div>

      {/* Form — stacks vertically on mobile, row on desktop */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">

        {/* Sport */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Sport
          </label>
          <select
            name="sport"
            defaultValue="soccer"
            className="w-full sm:w-auto px-3.5 py-2 rounded-md border border-slate-700 bg-[#0f2540] text-white text-sm cursor-pointer sm:min-w-40"
          >
            {SPORTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Date row — side by side even on mobile since they're short */}
        <div className="flex gap-3 items-end w- full sm:w-auto">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
              Start Date
            </label>
            <input
              name="start"
              type="date"
              defaultValue={today}
              className="w-full px-3.5 py-2 rounded-md border border-slate-700 bg-[#0f2540] text-white text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
              End Date
            </label>
            <input
              name="end"
              type="date"
              defaultValue={nextWeek}
              className="w-full px-3.5 py-2 rounded-md border border-slate-700 bg-[#0f2540] text-white text-sm"
            />
          </div>
        </div>

        {/* Search button — full width on mobile */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-2 rounded-md text-white text-sm font-semibold transition-colors duration-150
            ${loading
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
        >
          {loading ? "Loading..." : "Search"}
        </button>

      </form>
    </div>
  )
}