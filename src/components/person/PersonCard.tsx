import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, User, MapPin, Calendar } from 'lucide-react'
import { PersonWithBalance } from '@/types'

interface PersonCardProps {
  person: PersonWithBalance
  onClick: () => void
  onCall?: (number: string) => void
}

export default function PersonCard({ person, onClick, onCall }: PersonCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No payment recorded'
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600'
    if (balance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const primaryContact = person.contacts?.[0]

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={person.photo} />
            <AvatarFallback>
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{person.name}</h3>
              </div>
              {primaryContact && onCall && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 flex-shrink-0 px-2 sm:px-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCall(primaryContact.number)
                  }}
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-1 mt-2">
              {person.dob && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{formatDate(person.dob)}</span>
                </div>
              )}
              
              {person.address && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{person.address}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Balance</p>
                <p className={`font-bold text-base sm:text-lg ${getBalanceColor(person.balance)}`}>
                  {formatCurrency(Math.abs(person.balance))}
                  {person.balance > 0 && ' (Owed)'}
                  {person.balance < 0 && ' (Overpaid)'}
                </p>
              </div>
              
              <div className="flex-1 sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Last Paid</p>
                <p className="text-xs sm:text-sm font-medium">
                  {person.last_paid_date 
                    ? (
                      <span className="block sm:inline">
                        <span className="block sm:inline">{formatCurrency(person.last_paid_amount || 0)}</span>
                        <span className="block sm:inline sm:ml-1">on {formatDate(person.last_paid_date)}</span>
                      </span>
                    )
                    : 'No payment recorded'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}