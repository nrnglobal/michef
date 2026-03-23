import { createMenuPlan } from '@/lib/menu-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewMenuPage() {
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
        Plan menu
      </h1>

      <form action={createMenuPlan} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="visit_date"
            className="text-sm font-medium"
            style={{ color: '#1A1410' }}
          >
            Visit date
          </label>
          <Input
            id="visit_date"
            type="date"
            name="visit_date"
            required
            style={{ borderColor: '#E8E0D0' }}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
        >
          Create plan
        </Button>
      </form>
    </div>
  )
}
