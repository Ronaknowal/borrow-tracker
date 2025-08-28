import { supabase, isSupabaseConfigured } from './supabase'
import { Group, Person, Contact, Transaction } from '@/types'

// Helper function to check if database operations are available
const checkDatabaseAvailable = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please connect your Supabase project to use cloud features.')
  }
}

// Groups
export const getGroups = async (): Promise<Group[]> => {
  checkDatabaseAvailable()
  
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export const createGroup = async (group: Omit<Group, 'id' | 'created_at'>): Promise<Group> => {
  checkDatabaseAvailable()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('groups')
    .insert([{ ...group, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return data
}

// People
export const getPeople = async (): Promise<Person[]> => {
  checkDatabaseAvailable()
  
  const { data, error } = await supabase
    .from('people')
    .select(`
      *,
      group:groups(name),
      contacts(*),
      transactions(*)
    `)
    .order('name')

  if (error) throw error
  return data || []
}

export const createPerson = async (person: Omit<Person, 'id' | 'created_at'>): Promise<Person> => {
  checkDatabaseAvailable()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('people')
    .insert([{ ...person, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return data
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