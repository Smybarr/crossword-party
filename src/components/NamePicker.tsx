import { Input } from '@/components/ui/input'

interface NamePickerProps {
  value: string
  onChange: (name: string) => void
  recentNames: string[]
}

export function NamePicker({ value, onChange, recentNames }: NamePickerProps) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Your name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list="recent-names"
      />
      {recentNames.length > 0 && (
        <datalist id="recent-names">
          {recentNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}
      {recentNames.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {recentNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
