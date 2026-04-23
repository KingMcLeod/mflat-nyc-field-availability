// Format "X092-ZN06-SOCCER-4" → "X092 ZN06 · Soccer 4"
function formatFieldId(fieldId) {
  const parts = fieldId.split("-")
  const parkCode = parts[0]
  const number = parts[parts.length - 1]
  const zone = parts.find(p => p.startsWith("ZN"))
  const sport = parts.find(
    (p) => isNaN(p) && p.length > 2 && !p.startsWith("ZN") && p !== parkCode
  )
  const sportFormatted = sport
    ? sport.charAt(0) + sport.slice(1).toLowerCase()
    : ""
  return `${parkCode}${zone ? ` ${zone}` : ""} · ${sportFormatted} ${number}`
}

// Format "2026-04-28" → "Mon Apr 28"
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export default function AvailabilityCalendar({ data }) {
  if (!data) return null

  const { availability, sport, start, end } = data
  const fields = [...new Set(data.fields)]
  const dates = Object.keys(availability).sort()

  // Count fields available on at least one day
  const availableCount = fields.length

  if (availableCount === 0) {
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

      {/* Summary + Legend bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-slate-600 text-sm">
          <span className="font-semibold text-slate-800">{availableCount} {sport} fields</span>
          {" "}with availability between{" "}
          <span className="font-semibold text-slate-800">{formatDate(start)}</span>
          {" "}—{" "}
          <span className="font-semibold text-slate-800">{formatDate(end)}</span>
        </p>

        {/* Legend */}
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

      {/* Table container — horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="border-collapse text-sm w-full">

          {/* Header */}
          <thead>
            <tr>
              {/* Field column header — sticky left */}
              <th className="sticky left-0 top-0 z-30 bg-[#1e3a5f] text-white text-left px-4 py-3 font-semibold whitespace-nowrap min-w-[160px] border-r border-slate-600">
                Field
              </th>

              {/* Date column headers */}
              {dates.map((date) => (
                <th
                  key={date}
                  className="sticky top-0 z-20 bg-[#1e3a5f] text-white text-center px-3 py-3 font-semibold whitespace-nowrap min-w-[100px] border-r border-slate-600 last:border-r-0"
                >
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {fields.map((fieldId, rowIndex) => {
              const isEven = rowIndex % 2 === 0
              const rowBg = isEven ? "bg-white" : "bg-slate-50"

              return (
                <tr key={fieldId} className={`${rowBg} hover:bg-blue-50 transition-colors`}>

                  {/* Field name — sticky left */}
                  <td className={`sticky left-0 z-10 ${rowBg} px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap border-r border-slate-200`}>
                    {formatFieldId(fieldId)}
                  </td>

                  {/* Availability cells */}
                  {dates.map((date) => {
                    const isAvailable = availability[date].includes(fieldId)
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

      <p className="mt-3 text-xs text-slate-400">
        Availability checked at 9:00 AM per day. Fields with at least one available day are shown.
        Data from NYC Parks permit system — updated daily.
      </p>

    </div>
  )
}