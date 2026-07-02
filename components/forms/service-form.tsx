"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createService } from "@/lib/actions"

export function ServiceFormButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createService(formData)
      if (result?.error) setError(result.error)
      else setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <Plus className="h-4 w-4" /> New Service
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Service</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Dedicated 100Mbps Link" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} placeholder="Service details…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Bandwidth">Bandwidth</option>
                <option value="SLA">SLA</option>
                <option value="Managed Service">Managed Service</option>
                <option value="Installation">Installation</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_price">Monthly Price (ZMW)</Label>
                <Input id="monthly_price" name="monthly_price" type="number" min={0} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup_fee">Setup Fee (ZMW)</Label>
                <Input id="setup_fee" name="setup_fee" type="number" min={0} placeholder="1500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="is_active" name="is_active" type="checkbox" value="true" defaultChecked className="h-4 w-4 rounded border-input" />
              <Label htmlFor="is_active">Active</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {pending ? "Creating…" : "Create Service"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
