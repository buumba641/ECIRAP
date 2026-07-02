"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createActivity } from "@/lib/actions"
import type { Contact } from "@/lib/types"

export function ActivityFormButton({
  accountId,
  contacts,
}: {
  accountId: string
  contacts: Contact[]
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createActivity(formData)
      if (result?.error) setError(result.error)
      else setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Log Activity
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="account_id" value={accountId} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Call">📞 Call</option>
                  <option value="Email">📧 Email</option>
                  <option value="Meeting">🤝 Meeting</option>
                  <option value="Note">📝 Note</option>
                  <option value="Task">✅ Task</option>
                  <option value="Follow-up">🔄 Follow-up</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_id">Contact</Label>
                <select
                  id="contact_id"
                  name="contact_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select contact</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" name="subject" required placeholder="e.g. Discussed bandwidth upgrade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} placeholder="Activity details…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Input id="outcome" name="outcome" placeholder="e.g. Agreed to demo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Scheduled For</Label>
                <Input id="scheduled_at" name="scheduled_at" type="datetime-local" />
              </div>
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
                {pending ? "Saving…" : "Log Activity"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
