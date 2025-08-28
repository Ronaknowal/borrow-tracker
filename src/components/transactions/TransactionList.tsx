import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Transaction } from '@/types'
import { deleteTransaction } from '@/lib/database'
import EditTransactionDialog from '@/components/dialogs/EditTransactionDialog'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdated: () => void
}

export default function TransactionList({ transactions, onTransactionUpdated }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditDialog(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingTransaction) return
    
    setLoading(true)
    try {
      await deleteTransaction(deletingTransaction.id)
      console.log('Transaction deleted successfully')
      onTransactionUpdated()
      setShowDeleteDialog(false)
      setDeletingTransaction(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert(`Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionUpdated = () => {
    onTransactionUpdated()
    setShowEditDialog(false)
    setEditingTransaction(null)
  }

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions recorded yet.</p>
        <p className="text-sm mt-1">Add a borrowed amount or payment to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction) => (
        <Card key={transaction.id} className="border-l-4 border-l-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'borrowed' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {transaction.type === 'borrowed' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold text-lg ${
                      transaction.type === 'borrowed' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'borrowed' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <Badge variant={transaction.type === 'borrowed' ? 'destructive' : 'secondary'}>
                      {transaction.type === 'borrowed' ? 'Borrowed' : 'Paid'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(transaction.created_at)}
                  </p>
                  
                  {transaction.note && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                      {transaction.note}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(transaction)
                  }}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(transaction)
                  }}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        transaction={editingTransaction}
        onTransactionUpdated={handleTransactionUpdated}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingTransaction && (
            <div className="mt-2 p-3 bg-gray-50 rounded border">
              <p className="font-medium">
                <strong>{deletingTransaction.type === 'borrowed' ? 'Borrowed' : 'Paid'}: </strong>
                {formatCurrency(deletingTransaction.amount)}
              </p>
              {deletingTransaction.note && (
                <p className="text-sm text-gray-600 mt-1">Note: {deletingTransaction.note}</p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}