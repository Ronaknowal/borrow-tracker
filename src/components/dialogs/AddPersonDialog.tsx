import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createPerson } from '@/lib/database'
import { Group } from '@/types'
import { Loader2 } from 'lucide-react'

interface AddPersonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: Group[]
  onPersonAdded: () => void
}

export default function AddPersonDialog({ open, onOpenChange, groups, onPersonAdded }: AddPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    address: '',
    group_id: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createPerson({
        ...formData,
        group_id: formData.group_id || undefined
      })
      
      setFormData({ name: '', dob: '', address: '', group_id: '' })
      onPersonAdded()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating person:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select value={formData.group_id} onValueChange={(value) => setFormData({ ...formData, group_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Group</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}