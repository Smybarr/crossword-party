import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ClueDirection, ClueStatus } from '@/lib/types'

const ALL_STATUSES: { value: ClueStatus; label: string }[] = [
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'verified', label: 'Verified' },
]

export interface FilterValues {
  direction?: ClueDirection | null
  acrossChecked?: boolean
  downChecked?: boolean
  statuses?: ClueStatus[]
  pageMin?: number | null
  pageMax?: number | null
  numberMin?: number | null
  numberMax?: number | null
}

interface ClueFiltersProps {
  values: FilterValues
  onChange: (values: FilterValues) => void
  showStatus?: boolean
}

function deriveDirection(across: boolean, down: boolean): ClueDirection | null {
  if (across && !down) return 'Across'
  if (!across && down) return 'Down'
  return null // both or neither = no filter
}

const statusChipColors: Record<ClueStatus, { on: string; off: string }> = {
  unsolved: {
    on: 'bg-secondary text-secondary-foreground border-secondary-foreground/20',
    off: 'bg-secondary/30 text-muted-foreground border-transparent',
  },
  solved: {
    on: 'bg-primary/10 text-primary border-primary/30',
    off: 'bg-primary/5 text-muted-foreground border-transparent',
  },
  flagged: {
    on: 'bg-destructive/10 text-destructive border-destructive/30',
    off: 'bg-destructive/5 text-muted-foreground border-transparent',
  },
  verified: {
    on: 'bg-green-500/10 text-green-700 border-green-500/30',
    off: 'bg-green-500/5 text-muted-foreground border-transparent',
  },
}

export function ClueFilters({ values, onChange, showStatus = true }: ClueFiltersProps) {
  const across = values.acrossChecked ?? true
  const down = values.downChecked ?? true
  const selectedStatuses = values.statuses ?? ALL_STATUSES.map((s) => s.value)

  function toggleStatus(status: ClueStatus) {
    const isSelected = selectedStatuses.includes(status)
    const next = isSelected
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    onChange({ ...values, statuses: next })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Clue Direction</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-sm">
            <Checkbox
              checked={across}
              onCheckedChange={(checked) => {
                const next = !!checked
                onChange({
                  ...values,
                  acrossChecked: next,
                  direction: deriveDirection(next, down),
                })
              }}
            />
            Across
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <Checkbox
              checked={down}
              onCheckedChange={(checked) => {
                const next = !!checked
                onChange({
                  ...values,
                  downChecked: next,
                  direction: deriveDirection(across, next),
                })
              }}
            />
            Down
          </label>
        </div>
      </div>

      {showStatus && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_STATUSES.map(({ value, label }) => {
              const isOn = selectedStatuses.includes(value)
              const colors = statusChipColors[value]
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStatus(value)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    isOn ? colors.on : colors.off,
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Clue Number Range</label>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            className="w-[80px]"
            min={1}
            placeholder="Min"
            value={values.numberMin ?? ''}
            onChange={(e) =>
              onChange({ ...values, numberMin: e.target.value ? Number(e.target.value) : null })
            }
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            className="w-[80px]"
            min={1}
            placeholder="Max"
            value={values.numberMax ?? ''}
            onChange={(e) =>
              onChange({ ...values, numberMax: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Clue Book Page Range</label>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            className="w-[70px]"
            min={1}
            max={103}
            value={values.pageMin ?? 1}
            onChange={(e) =>
              onChange({ ...values, pageMin: e.target.value ? Number(e.target.value) : 1 })
            }
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            className="w-[70px]"
            min={1}
            max={103}
            value={values.pageMax ?? 103}
            onChange={(e) =>
              onChange({ ...values, pageMax: e.target.value ? Number(e.target.value) : 103 })
            }
          />
        </div>
      </div>
    </div>
  )
}
