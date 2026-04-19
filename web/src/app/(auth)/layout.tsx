export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-2xl font-bold text-white">
            M
          </div>
          <h1 className="text-xl font-bold">Max Impulso</h1>
          <p className="text-sm text-muted-foreground">
            Seu mentor virtual de negócios
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
