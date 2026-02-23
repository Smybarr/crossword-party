import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'


export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      <div className="relative h-5 w-5">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="text-[10px]">Theme</span>
    </button>
  )
}
