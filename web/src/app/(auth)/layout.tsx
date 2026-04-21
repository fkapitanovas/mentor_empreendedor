export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="tropical-mesh flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-primary text-primary-foreground rounded-full font-heading text-xs font-bold uppercase tracking-widest shadow-hard-sm -rotate-[2deg]">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sun)] font-heading text-sm font-extrabold text-on-bright"
              aria-hidden
            >
              M
            </span>
            Max Impulso
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
