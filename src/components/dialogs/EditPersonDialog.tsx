import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PersonWithBalance, Group } from '@/types'
import { updatePerson } from '@/lib/database'
import { Loader2, X, Upload, User } from 'lucide-react'

interface EditPersonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: PersonWithBalance
  groups: Group[]
  onPersonUpdated: () => void
}

export default function EditPersonDialog({ 
  open, 
  onOpenChange, 
  person, 
  groups, 
  onPersonUpdated 
}: EditPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: person.name,
    dob: person.dob || '',
    address: person.address || '',
    group_id: person.group_id || '',
    photo: person.photo || ''
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(person.photo || null)

  // Reset form when person changes
  useEffect(() => {
    setFormData({
      name: person.name,
      dob: person.dob || '',
      address: person.address || '',
      group_id: person.group_id || '',
      photo: person.photo || ''
    })
    setImagePreview(person.photo || null)
  }, [person])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData({ ...formData, photo: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, photo: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Updating person with data:', formData)
      
      // Create updates object, only including changed fields
      const updates: any = {}
      if (formData.name !== person.name) updates.name = formData.name
      if (formData.dob !== (person.dob || '')) updates.dob = formData.dob || null
      if (formData.address !== (person.address || '')) updates.address = formData.address || null
      if (formData.group_id !== (person.group_id || '')) updates.group_id = formData.group_id || null
      if (formData.photo !== (person.photo || '')) updates.photo = formData.photo || null

      console.log('Updates to apply:', updates)

      if (Object.keys(updates).length > 0) {
        await updatePerson(person.id, updates)
        console.log('Person updated successfully')
      } else {
        console.log('No changes detected')
      }
      
      // Close dialog and trigger refresh
      onPersonUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating person:', error)
      alert(`Failed to update person: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Edit {person.name}</DialogTitle>
          <DialogDescription>
            Update the person's profile information, contact details, and group assignment.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={imagePreview || ''} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  id="edit-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-dob">Date of Birth</Label>
            <Input
              id="edit-dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-group">Group</Label>
            <Select value={formData.group_id || "no-group"} onValueChange={(value) => setFormData({ ...formData, group_id: value === "no-group" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group (optional)" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="no-group">No Group</SelectItem>
                {(groups || []).map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
