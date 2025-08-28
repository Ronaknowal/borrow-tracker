import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, LogOut, Settings } from 'lucide-react'
import PersonCard from '@/components/person/PersonCard'
import { Group, PersonWithBalance } from '@/types'
import { getGroups, getPeople } from '@/lib/database'
import { signOut } from '@/lib/auth'

interface HomePageProps {
  onPersonClick: (person: PersonWithBalance) => void
  onAddPerson: () => void
  onAddGroup: () => void
}

export default function HomePage({ onPersonClick, onAddPerson, onAddGroup }: HomePageProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [people, setPeople] = useState<PersonWithBalance[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [groupsData, peopleData] = await Promise.all([
        getGroups(),
        getPeople()
      ])
      setGroups(groupsData)
      setPeople(peopleData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const filteredPeople = people
    .filter(person => {
      if (selectedGroup !== 'all' && person.group_id !== selectedGroup) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return person.name.toLowerCase().includes(query) ||
               person.contacts?.some(contact => contact.number.includes(query))
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'balance-high':
          return b.balance - a.balance
        case 'balance-low':
          return a.balance - b.balance
        case 'last-paid':
          // Only sort people with balance > 0 (people who still owe money)
          // People with no balance go to the end
          if (a.balance <= 0 && b.balance <= 0) return 0
          if (a.balance <= 0) return 1  // a goes to end
          if (b.balance <= 0) return -1 // b goes to end
          
          // For people with balance, sort by last payment date
          // People who haven't paid (no last_paid_date) come first
          // People who paid longest ago come next
          // People who paid most recently come last
          const aDate = a.last_paid_date ? new Date(a.last_paid_date).getTime() : 0
          const bDate = b.last_paid_date ? new Date(b.last_paid_date).getTime() : 0
          
          return aDate - bDate // Ascending order (oldest payments first, no payments at very beginning)
        default:
          return 0
      }
    })

  const totalBalance = people.reduce((sum, person) => sum + person.balance, 0)
  const totalOwed = people.filter(p => p.balance > 0).reduce((sum, person) => sum + person.balance, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Borrow Tracker</h1>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {people.length} customers
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold">{people.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Owed</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                ₹{totalOwed.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Net Balance</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className={`text-xl sm:text-2xl font-bold ${totalBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(totalBalance).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter and Sort - Two columns on mobile, inline on desktop */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="balance-high">Balance (High-Low)</SelectItem>
                  <SelectItem value="balance-low">Balance (Low-High)</SelectItem>
                  <SelectItem value="last-paid">Payment Priority (Needs Payment First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button onClick={onAddPerson} className="flex-1 sm:flex-initial">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
              <Button variant="outline" onClick={onAddGroup} className="flex-1 sm:flex-initial">
                <Users className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
          </div>
        </div>

        {/* People List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredPeople.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
                </p>
                <Button onClick={onAddPerson}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => onPersonClick(person)}
                onCall={handleCall}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}