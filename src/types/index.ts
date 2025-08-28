export interface User {
  id: string
  email: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  created_at: string
  user_id: string
}

export interface Person {
  id: string
  name: string
  dob?: string
  address?: string
  photo?: string
  group_id?: string
  user_id: string
  last_paid_date?: string
  last_paid_amount?: number
  created_at: string
}

export interface Contact {
  id: string
  person_id: string
  number: string
  tag: string
}

export interface Document {
  id: string
  person_id: string
  file_path: string
  description?: string
  created_at: string
}

export interface Transaction {
  id: string
  person_id: string
  type: 'borrowed' | 'paid'
  amount: number
  note?: string
  created_at: string
}

export interface PersonWithBalance extends Person {
  balance: number
  contacts: Contact[]
  documents: Document[]
  transactions: Transaction[]
}