import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthPage from '@/components/auth/AuthPage'
import HomePage from '@/pages/HomePage'
import PersonProfile from '@/components/person/PersonProfile'
import AddPersonDialog from '@/components/dialogs/AddPersonDialog'
import AddGroupDialog from '@/components/dialogs/AddGroupDialog'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { getGroups, getPeople } from '@/lib/database'
import { Group, PersonWithBalance } from '@/types'

const queryClient = new QueryClient()

type View = 'home' | 'person-profile'

const App = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('home')
  const [selectedPerson, setSelectedPerson] = useState<PersonWithBalance | null>(null)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    // Check initial auth state
    getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      const groupsData = await getGroups()
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state listener
  }

  const handlePersonClick = (person: PersonWithBalance) => {
    setSelectedPerson(person)
    setCurrentView('person-profile')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedPerson(null)
  }

  const handlePersonUpdated = () => {
    // Refresh data - in a real app you might want to be more specific
    window.location.reload()
  }

  const handlePersonAdded = () => {
    loadGroups()
    // Refresh data
    window.location.reload()
  }

  const handleGroupAdded = () => {
    loadGroups()
  }

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

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        
        {currentView === 'home' && (
          <HomePage
            onPersonClick={handlePersonClick}
            onAddPerson={() => setShowAddPerson(true)}
            onAddGroup={() => setShowAddGroup(true)}
          />
        )}
        
        {currentView === 'person-profile' && selectedPerson && (
          <PersonProfile
            person={selectedPerson}
            onBack={handleBackToHome}
            onPersonUpdated={handlePersonUpdated}
          />
        )}
        
        <AddPersonDialog
          open={showAddPerson}
          onOpenChange={setShowAddPerson}
          groups={groups}
          onPersonAdded={handlePersonAdded}
        />
        
        <AddGroupDialog
          open={showAddGroup}
          onOpenChange={setShowAddGroup}
          onGroupAdded={handleGroupAdded}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App