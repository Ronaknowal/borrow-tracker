import { supabase, isSupabaseConfigured } from './supabase'

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const signUp = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please connect your Supabase project.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please connect your Supabase project.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Please connect your Supabase project.')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}