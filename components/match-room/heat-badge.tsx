import { heatForDisplay } from "@/lib/heat"

export function HeatBadge({ heat }: { heat: number }) {
  const value = heatForDisplay(heat)
  const label = value >= 70 ? "High" : value >= 35 ? "Building" : "Steady"

  return (
    <div
      aria-label={`${label} Heat: ${value} out of 100`}
      className="min-w-28 rounded-2xl border border-orange-200/25 bg-orange-300/10 px-3 py-2 text-right"
    >
      <p className="text-[10px] font-bold tracking-[0.16em] text-orange-100">
        HEAT
      </p>
      <p className="mt-0.5 text-sm font-semibold text-orange-50">
        {label} <span className="text-orange-200">{value}</span>
      </p>
    </div>
  )
}
