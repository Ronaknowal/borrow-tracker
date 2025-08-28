import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTransaction } from '@/lib/database'
import { Loader2 } from 'lucide-react'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personId: string
  type: 'borrowed' | 'paid'
  onTransactionAdded: () => void
}

export default function TransactionDialog({ 
  open, 
  onOpenChange, 
  personId, 
  type, 
  onTransactionAdded 
}: TransactionDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    note: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createTransaction({
        person_id: personId,
        type,
        amount: parseFloat(formData.amount),
        note: formData.note || undefined
      })
      
      setFormData({ amount: '', note: '' })
      onTransactionAdded()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const title = type === 'borrowed' ? 'Add Borrowed Amount' : 'Add Payment'
  const buttonText = type === 'borrowed' ? 'Record Borrowed' : 'Record Payment'
  const amountLabel = type === 'borrowed' ? 'Amount Borrowed' : 'Amount Paid'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{amountLabel} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note about this transaction..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.amount}
              className={type === 'borrowed' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}