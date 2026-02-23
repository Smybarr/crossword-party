import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { ClueDirection, ClueStatus } from '@/lib/types'

export interface FilterValues {
  direction?: ClueDirection | null
  acrossChecked?: boolean
  downChecked?: boolean
  status?: ClueStatus | null
  pageMin?: number | null
  pageMax?: number | null
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

export function ClueFilters({ values, onChange, showStatus = true }: ClueFiltersProps) {
  const across = values.acrossChecked ?? true
  const down = values.downChecked ?? true

  return (
    <div className="flex flex-wrap gap-4 items-end">
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
        <Select
          value={values.status ?? 'all'}
          onValueChange={(v) =>
            onChange({ ...values, status: v === 'all' ? null : (v as ClueStatus) })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unsolved">Unsolved</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Page Range</label>
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
