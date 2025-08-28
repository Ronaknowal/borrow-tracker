import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment or use fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize database tables if Supabase is configured
export const initializeDatabase = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Please connect your Supabase project.')
    return false
  }

  try {
    // Test connection
    const { data, error } = await supabase.from('groups').select('count').limit(1)
    if (error && error.code === '42P01') {
      // Table doesn't exist, but connection works
      console.log('Database connected, but tables need to be created')
    }
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}