'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'segmented' }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // next-themes requires a mount flag to avoid hydration mismatch on the
    // dynamic icon/label. This is the officially documented pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (variant === 'segmented') {
    return (
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              theme === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    )
  }

  const currentLabel =
    theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'
  const ariaLabel = `Tema atual: ${currentLabel}. Clique para alternar.`

  const Icon =
    theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun

  return (
    <button
      onClick={() => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={mounted ? ariaLabel : 'Alternar tema'}
    >
      {mounted ? (
        <Icon className="size-4" />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}
