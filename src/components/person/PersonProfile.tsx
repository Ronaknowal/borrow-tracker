import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Phone, Edit, Calendar, MapPin } from 'lucide-react'
import { PersonWithBalance, Transaction, Group } from '@/types'
import TransactionDialog from '@/components/dialogs/TransactionDialog'
import TransactionList from '@/components/transactions/TransactionList'
import DocumentUpload from '@/components/person/DocumentUpload'
import EditPersonDialog from '@/components/dialogs/EditPersonDialog'
import { getDocuments, DocumentData, getGroups } from '@/lib/database'

interface PersonProfileProps {
  person: PersonWithBalance
  onBack: () => void
  onPersonUpdated: () => void
}

export default function PersonProfile({ person, onBack, onPersonUpdated }: PersonProfileProps) {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [transactionType, setTransactionType] = useState<'borrowed' | 'paid'>('borrowed')
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])

  // Load documents from Supabase database
  useEffect(() => {
    loadDocuments()
    loadGroups()
  }, [person.id])

  const loadGroups = async () => {
    try {
      const groupsData = await getGroups()
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading groups:', error)
      setGroups([])
    }
  }

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const documentsData = await getDocuments(person.id)
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error loading documents:', error)
      // If database is not set up, fallback to empty array
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleDocumentAdded = (document: DocumentData) => {
    setDocuments(prev => [document, ...prev])
  }

  const handleDocumentRemoved = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

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
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 sm:mr-4 px-2 sm:px-3">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{person.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Profile Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                <AvatarImage src={person.photo} />
                <AvatarFallback className="text-xl sm:text-2xl">
                  {person.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">{person.name}</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  {person.dob && (
                    <div className="flex items-center text-sm sm:text-base text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>DOB: {formatDate(person.dob)}</span>
                    </div>
                  )}
                  
                  {person.address && (
                    <div className="flex items-center text-sm sm:text-base text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{person.address}</span>
                    </div>
                  )}
                </div>
                
                {/* Contacts */}
                {person.contacts && person.contacts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Contacts</h4>
                    <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-2">
                      {person.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between sm:justify-start space-x-2 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded sm:rounded-none">
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {contact.tag}: {contact.number}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="px-2"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Current Balance</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className={`text-base sm:text-2xl font-bold ${getBalanceColor(person.balance)}`}>
                {formatCurrency(Math.abs(person.balance))}
                {person.balance > 0 && (
                  <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs">Owed</Badge>
                )}
                {person.balance < 0 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">Overpaid</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Borrowed</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-base sm:text-2xl font-bold text-red-600">
                {formatCurrency(totalBorrowed)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Paid</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-base sm:text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Last Payment</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-xs sm:text-sm">
                {person.last_paid_date ? (
                  <>
                    <div className="font-bold text-sm sm:text-base">{formatCurrency(person.last_paid_amount || 0)}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">{formatDate(person.last_paid_date)}</div>
                  </>
                ) : (
                  <div className="text-gray-500">No payments yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Actions */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={() => handleAddTransaction('borrowed')}
                variant="destructive"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Borrowed Amount
              </Button>
              <Button 
                onClick={() => handleAddTransaction('paid')}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <DocumentUpload
          personId={person.id}
          personName={person.name}
          documents={documents}
          onDocumentAdded={handleDocumentAdded}
          onDocumentRemoved={handleDocumentRemoved}
        />

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

      <EditPersonDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        person={person}
        groups={groups}
        onPersonUpdated={onPersonUpdated}
      />
    </div>
  )
}