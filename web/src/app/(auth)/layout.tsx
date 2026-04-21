export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] text-xl font-bold text-white font-heading">
            M
          </div>
          <h1 className="font-heading text-xl font-bold text-primary">Max Impulso</h1>
          <p className="text-sm text-muted-foreground">
            Seu mentor virtual de negocios
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
