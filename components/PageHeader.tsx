export default function PageHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge && <div className="pill mb-3 border-[#8E24AA]/20 bg-[#8E24AA]/5 text-[#8E24AA]">{badge}</div>}
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-base font-medium text-slate-500">{subtitle}</p>}
      </div>
      <div className="hidden rounded-2xl bg-black px-5 py-3 text-sm font-black text-white sm:block">
        <span className="text-[#FFC107]">●</span> Live Operations
      </div>
    </div>
  )
}
