/**
 * StatCard — displays a single KPI metric.
 *
 * Props:
 *   title    {string}
 *   value    {string|number}
 *   subtitle {string}        — shown below value (e.g. "↑ 8% vs yesterday")
 *   icon     {ReactNode}
 *   accent   {string}        — Tailwind color class for the icon background
 *   delay    {number}        — animation delay index (0-4)
 *   id       {string}        — unique HTML id for the card
 */
export default function StatCard({ title, value, subtitle, valueColor = 'text-gray-900', delay = 0, id }) {
  const delays = ['', 'delay-100', 'delay-200', 'delay-300', 'delay-400']

  return (
    <div
      id={id}
      className={`glass-card rounded-2xl p-6 flex flex-col justify-between animate-fade-up ${delays[delay]}`}
    >
      <div className="text-sm font-medium text-gray-500 max-w-[120px] leading-tight mb-4">
        {title}
      </div>

      <div>
        <div className={`text-4xl font-extrabold tracking-tight mb-2 ${valueColor}`}>
          {value ?? '—'}
        </div>
        
        {subtitle && (
          <div className="text-sm text-gray-500 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
