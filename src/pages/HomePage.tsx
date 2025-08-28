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
          return new Date(b.last_paid_date || 0).getTime() - new Date(a.last_paid_date || 0).getTime()
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Borrow Tracker</h1>
              <Badge variant="secondary" className="text-sm">
                {people.length} customers
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalOwed.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(totalBalance).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="balance-high">Balance (High-Low)</SelectItem>
                <SelectItem value="balance-low">Balance (Low-High)</SelectItem>
                <SelectItem value="last-paid">Last Paid (Recent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={onAddPerson}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
            <Button variant="outline" onClick={onAddGroup}>
              <Users className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
        </div>

        {/* People List */}
        <div className="space-y-4">
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