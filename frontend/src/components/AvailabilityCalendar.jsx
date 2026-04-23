import { useState } from "react"

const BOROUGH_MAP = {
  B: "Brooklyn",
  M: "Manhattan",
  Q: "Queens",
  R: "Staten Island",
  X: "Bronx",
}

// Format "X092-ZN06-SOCCER-4" → "X092 ZN06 · Soccer 4"
function formatFieldId(fieldId) {
  const parts = fieldId.split("-")
  const parkCode = parts[0]
  const number = parts[parts.length - 1]
  const zone = parts.find(p => p.startsWith("ZN"))
  const sport = parts.find(
    (p) => isNaN(p) && p.length > 2 && !p.startsWith("ZN") && p !== parkCode
  )
  const sportFormatted = sport ? sport.charAt(0) + sport.slice(1).toLowerCase() : ""
  return `${parkCode}${zone ? ` ${zone}` : ""} · ${sportFormatted} ${number}`
}

// Format "2026-04-28" → "Mon Apr 28"
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function AvailabilityCalendar({ data }) {
  if (!data) return null
  return <CalendarView data={data} />
}

function CalendarView({ data }) {
  const { availability, sport, start, end } = data
  const fields      = [...new Set(data.fields)]
  const allDates    = Object.keys(availability).sort()

  // Borough options derived from the field list
  const boroughLetters = [...new Set(fields.map(f => f[0]))]
    .filter(l => BOROUGH_MAP[l])
    .sort((a, b) => BOROUGH_MAP[a].localeCompare(BOROUGH_MAP[b]))

  const [page,               setPage]               = useState(0)
  const [selectedBoroughs,   setSelectedBoroughs]   = useState(() => new Set(boroughLetters))
  const [availabilityFilter, setAvailabilityFilter] = useState("any")

  // Pagination
  const DAYS_PER_PAGE = 7
  const totalPages    = Math.ceil(allDates.length / DAYS_PER_PAGE)
  const visibleDates  = allDates.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE)

  // Filtering — always evaluated against the full date range, not just the current page
  const filteredFields = fields.filter(f => {
    if (!selectedBoroughs.has(f[0])) return false
    const availCount = allDates.filter(d => availability[d]?.includes(f)).length
    if (availabilityFilter === "all")     return availCount === allDates.length
    if (availabilityFilter === "partial") return availCount > 0 && availCount < allDates.length
    return true
  })

  function toggleBorough(letter) {
    setSelectedBoroughs(prev => {
      if (prev.has(letter) && prev.size === 1) return prev // keep at least one selected
      const next = new Set(prev)
      next.has(letter) ? next.delete(letter) : next.add(letter)
      return next
    })
  }

  if (fields.length === 0) {
    return (
      <div className="mx-4 sm:mx-8 mt-8 p-6 bg-white rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">
          No fields found for <strong>{sport}</strong> between {start} and {end}.
          Try a different sport or date range.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-4 sm:mx-8 mt-6 mb-10">

      {/* Summary + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-slate-600 text-sm">
          <span className="font-semibold text-slate-800">{filteredFields.length} {sport} fields</span>
          {filteredFields.length !== fields.length && (
            <span className="text-slate-400"> (of {fields.length})</span>
          )}
          {" "}with availability between{" "}
          <span className="font-semibold text-slate-800">{formatDate(start)}</span>
          {" "}—{" "}
          <span className="font-semibold text-slate-800">{formatDate(end)}</span>
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span className="text-slate-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200 space-y-3">

        {/* Borough — only render if more than one borough is present */}
        {boroughLetters.length > 1 && (
          <div className="flex items-start gap-3 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 w-20 shrink-0 pt-0.5">
              Borough
            </span>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {boroughLetters.map(letter => (
                <label key={letter} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedBoroughs.has(letter)}
                    onChange={() => toggleBorough(letter)}
                  />
                  {BOROUGH_MAP[letter]}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 w-20 shrink-0 pt-0.5">
            Show
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { value: "any",     label: "Any availability" },
              { value: "all",     label: "All days free" },
              { value: "partial", label: "Partial only" },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={availabilityFilter === opt.value}
                  onChange={() => setAvailabilityFilter(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev week
          </button>
          <span className="text-sm text-slate-500">
            Week {page + 1} of {totalPages}
            {" · "}
            {formatDate(visibleDates[0])} – {formatDate(visibleDates[visibleDates.length - 1])}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next week →
          </button>
        </div>
      )}

      {/* Empty filter state */}
      {filteredFields.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            No fields match the current filters. Try adjusting borough or availability.
          </p>
        </div>
      ) : (

        /* Table */
        <div className="overflow-auto rounded-xl border border-slate-200 shadow-sm max-h-[calc(100vh-220px)]">
          <table className="border-collapse text-sm w-full">

            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-30 bg-[#1e3a5f] text-white text-left px-4 py-3 font-semibold whitespace-nowrap min-w-[160px] border-r border-slate-600">
                  Field
                </th>
                {visibleDates.map(date => (
                  <th
                    key={date}
                    className="sticky top-0 z-20 bg-[#1e3a5f] text-white text-center px-3 py-3 font-semibold whitespace-nowrap min-w-[100px] border-r border-slate-600 last:border-r-0"
                  >
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredFields.map((fieldId, rowIndex) => {
                const isEven = rowIndex % 2 === 0
                const rowBg  = isEven ? "bg-white" : "bg-slate-50"
                return (
                  <tr key={fieldId} className={`${rowBg} hover:bg-blue-50 transition-colors`}>
                    <td className={`sticky left-0 z-10 ${rowBg} px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap border-r border-slate-200`}>
                      {formatFieldId(fieldId)}
                    </td>
                    {visibleDates.map(date => {
                      const isAvailable = availability[date]?.includes(fieldId)
                      return (
                        <td
                          key={date}
                          className={`text-center px-3 py-2.5 border-r border-slate-100 last:border-r-0
                            ${isAvailable ? "bg-green-50" : "bg-red-50"}`}
                        >
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold
                            ${isAvailable ? "bg-green-500" : "bg-red-400"}`}
                          >
                            {isAvailable ? "✓" : "✗"}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>

          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Data from NYC Parks permit system. Fields with at least one available day are shown.
      </p>

    </div>
  )
}
