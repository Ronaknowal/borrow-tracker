import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Phone, Edit, Calendar, MapPin } from 'lucide-react'
import { PersonWithBalance, Transaction } from '@/types'
import TransactionDialog from '@/components/dialogs/TransactionDialog'
import TransactionList from '@/components/transactions/TransactionList'

interface PersonProfileProps {
  person: PersonWithBalance
  onBack: () => void
  onPersonUpdated: () => void
}

export default function PersonProfile({ person, onBack, onPersonUpdated }: PersonProfileProps) {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [transactionType, setTransactionType] = useState<'borrowed' | 'paid'>('borrowed')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600'
    if (balance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  const handleAddTransaction = (type: 'borrowed' | 'paid') => {
    setTransactionType(type)
    setShowTransactionDialog(true)
  }

  const totalBorrowed = person.transactions
    .filter(t => t.type === 'borrowed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPaid = person.transactions
    .filter(t => t.type === 'paid')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">{person.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={person.photo} />
                <AvatarFallback className="text-2xl">
                  {person.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{person.name}</h2>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {person.dob && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>DOB: {formatDate(person.dob)}</span>
                    </div>
                  )}
                  
                  {person.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{person.address}</span>
                    </div>
                  )}
                </div>
                
                {/* Contacts */}
                {person.contacts && person.contacts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Contacts</h4>
                    <div className="flex flex-wrap gap-2">
                      {person.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {contact.tag}: {contact.number}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCall(contact.number)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getBalanceColor(person.balance)}`}>
                {formatCurrency(Math.abs(person.balance))}
                {person.balance > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">Owed</Badge>
                )}
                {person.balance < 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">Overpaid</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Borrowed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalBorrowed)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {person.last_paid_date ? (
                  <>
                    <div className="font-bold">{formatCurrency(person.last_paid_amount || 0)}</div>
                    <div className="text-gray-500">{formatDate(person.last_paid_date)}</div>
                  </>
                ) : (
                  <div className="text-gray-500">No payments yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleAddTransaction('borrowed')}
                variant="destructive"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Borrowed Amount
              </Button>
              <Button 
                onClick={() => handleAddTransaction('paid')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={person.transactions} 
              onTransactionUpdated={onPersonUpdated}
            />
          </CardContent>
        </Card>
      </div>

      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        personId={person.id}
        type={transactionType}
        onTransactionAdded={onPersonUpdated}
      />
    </div>
  )
}