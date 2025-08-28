import { supabase, isSupabaseConfigured } from './supabase'
import { Group, Person, Contact, Transaction, PersonWithBalance } from '@/types'

// Helper function to check if database operations are available
const checkDatabaseAvailable = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please connect your Supabase project to use cloud features.')
  }
}

// Helper function to check if tables exist
const checkTablesExist = async () => {
  try {
    // Try to query the groups table to see if it exists
    const { error } = await supabase.from('groups').select('count').limit(1)
    if (error && error.code === '42P01') {
      throw new Error('Database tables do not exist. Please run the database schema setup first.')
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database tables do not exist')) {
      throw error
    }
    // Other errors might be permission related, but we'll let them through
  }
}

// Groups
export const getGroups = async (): Promise<Group[]> => {
  checkDatabaseAvailable()
  
  try {
    // Check if tables exist first
    await checkTablesExist()
    
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching groups:', error)
      throw error
    }
    
    console.log('Groups fetched successfully:', data)
    return data || []
  } catch (error) {
    console.error('Error in getGroups:', error)
    throw error
  }
}

export const createGroup = async (name: string): Promise<Group> => {
  checkDatabaseAvailable()
  
  try {
    // Check if tables exist first
    await checkTablesExist()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Creating group:', { name, user_id: user.id })

    const { data, error } = await supabase
      .from('groups')
      .insert([{ name, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      throw error
    }
    
    console.log('Group created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createGroup:', error)
    throw error
  }
}

// People
export const getPeople = async (): Promise<PersonWithBalance[]> => {
  checkDatabaseAvailable()
  
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        group:groups(name),
        contacts(*),
        transactions(*)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching people:', error)
      throw error
    }
    
    console.log('People fetched successfully:', data)
    
    // Calculate balance and last payment info for each person
    const peopleWithBalance = (data || []).map(person => {
      const balance = person.transactions?.reduce((total, transaction) => {
        if (transaction.type === 'borrowed') {
          return total + transaction.amount
        } else if (transaction.type === 'paid') {
          return total - transaction.amount
        }
        return total
      }, 0) || 0

      // Find the most recent payment
      const paymentTransactions = person.transactions?.filter(t => t.type === 'paid') || []
      const lastPayment = paymentTransactions.length > 0 
        ? paymentTransactions.reduce((latest, current) => 
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
          )
        : null

      return {
        ...person,
        balance,
        last_paid_date: lastPayment?.created_at || null,
        last_paid_amount: lastPayment?.amount || null,
        contacts: person.contacts || [],
        documents: [] // TODO: Implement documents
      } as PersonWithBalance
    })

    return peopleWithBalance
  } catch (error) {
    console.error('Error in getPeople:', error)
    throw error
  }
}

export const createPerson = async (person: Omit<Person, 'id' | 'created_at' | 'user_id'>): Promise<Person> => {
  checkDatabaseAvailable()
  
  try {
    // Check if tables exist first
    await checkTablesExist()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Creating person:', { ...person, user_id: user.id })

    const { data, error } = await supabase
      .from('people')
      .insert([{ ...person, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error('Error creating person:', error)
      throw error
    }
    
    console.log('Person created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createPerson:', error)
    throw error
  }
}

export const updatePerson = async (id: string, updates: Partial<Omit<Person, 'id' | 'created_at' | 'user_id'>>): Promise<Person> => {
  checkDatabaseAvailable()
  
  try {
    // Check if tables exist first
    await checkTablesExist()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Updating person:', { id, updates })

    const { data, error } = await supabase
      .from('people')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own people
      .select()
      .single()

    if (error) {
      console.error('Error updating person:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('Person not found or access denied')
    }
    
    console.log('Person updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updatePerson:', error)
    throw error
  }
}

// Contacts
export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
  checkDatabaseAvailable()
  
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select()
    .single()

  if (error) throw error
  return data
}

// Transactions
export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
  checkDatabaseAvailable()
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single()

  if (error) throw error

  // Update person's last payment info if this is a payment
  if (transaction.type === 'paid') {
    await supabase
      .from('people')
      .update({
        last_paid_date: new Date().toISOString(),
        last_paid_amount: transaction.amount
      })
      .eq('id', transaction.person_id)
  }

  return data
}

export const getTransactions = async (personId: string): Promise<Transaction[]> => {
  checkDatabaseAvailable()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> => {
  checkDatabaseAvailable()
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
    
    console.log('Transaction updated successfully:', data)
    
    // Update person's last_paid_date if this was a payment transaction
    if (updates.type === 'paid' || (data.type === 'paid' && updates.amount)) {
      await supabase
        .from('people')
        .update({
          last_paid_date: new Date().toISOString(),
          last_paid_amount: updates.amount || data.amount
        })
        .eq('id', data.person_id)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateTransaction:', error)
    throw error
  }
}

export const deleteTransaction = async (id: string): Promise<void> => {
  checkDatabaseAvailable()
  
  try {
    // First get the transaction to know if we need to update person's last payment info
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError)
      throw fetchError
    }

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting transaction:', deleteError)
      throw deleteError
    }
    
    console.log('Transaction deleted successfully')
    
    // If this was a payment, we might need to update the person's last payment info
    if (transaction.type === 'paid') {
      // Get the most recent payment for this person (excluding the deleted one)
      const { data: remainingPayments } = await supabase
        .from('transactions')
        .select('*')
        .eq('person_id', transaction.person_id)
        .eq('type', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)

      if (remainingPayments && remainingPayments.length > 0) {
        // Update with the most recent remaining payment
        const lastPayment = remainingPayments[0]
        await supabase
          .from('people')
          .update({
            last_paid_date: lastPayment.created_at,
            last_paid_amount: lastPayment.amount
          })
          .eq('id', transaction.person_id)
      } else {
        // No payments left, clear the last payment info
        await supabase
          .from('people')
          .update({
            last_paid_date: null,
            last_paid_amount: null
          })
          .eq('id', transaction.person_id)
      }
    }
  } catch (error) {
    console.error('Error in deleteTransaction:', error)
    throw error
  }
}

// Documents
export interface DocumentData {
  id: string
  person_id: string
  name: string
  file_type: string
  file_size: number
  file_data?: string
  storage_path?: string
  description?: string
  created_at: string
}

export const getDocuments = async (personId: string): Promise<DocumentData[]> => {
  checkDatabaseAvailable()
  
  try {
    await checkTablesExist()
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
    
    console.log('Documents fetched successfully:', data)
    return data || []
  } catch (error) {
    console.error('Error in getDocuments:', error)
    throw error
  }
}

export const createDocument = async (document: Omit<DocumentData, 'id' | 'created_at'>): Promise<DocumentData> => {
  checkDatabaseAvailable()
  
  try {
    await checkTablesExist()
    
    console.log('Creating document:', document)

    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      throw error
    }
    
    console.log('Document created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createDocument:', error)
    throw error
  }
}

export const deleteDocument = async (documentId: string): Promise<void> => {
  checkDatabaseAvailable()
  
  try {
    await checkTablesExist()
    
    console.log('Deleting document:', documentId)

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('Error deleting document:', error)
      throw error
    }
    
    console.log('Document deleted successfully')
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    throw error
  }
}