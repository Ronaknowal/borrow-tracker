# Borrow Tracker Setup Guide

## Database Setup

The main issue preventing adding users, persons, and groups is that the database tables haven't been created yet. Follow these steps to set up your Supabase database:

### 1. Access Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Navigate to your project (the one with URL: `https://xtrpzxafpewrtvtaeawh.supabase.co`)
3. Go to the **SQL Editor** in the left sidebar

### 2. Create Database Tables

1. In the SQL Editor, copy and paste the entire contents of `database-schema.sql`
2. Click **Run** to execute the SQL script
3. This will create all the necessary tables with proper Row Level Security (RLS) policies

### 3. Verify Tables Are Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `groups`
   - `people`
   - `contacts`
   - `documents`
   - `transactions`

### 4. Test the Application

1. Start your development server: `npm run dev` or `pnpm dev`
2. Open the browser console to see debug logs
3. Try to add a group or person
4. Check the console for any error messages

## Common Issues & Solutions

### Issue: "Table doesn't exist" error
**Solution**: Run the database schema SQL script in Supabase SQL Editor

### Issue: "User not authenticated" error
**Solution**: Make sure you're signed in to the app before trying to add data

### Issue: "Row Level Security" error
**Solution**: The RLS policies are set up to only allow users to access their own data. Make sure you're authenticated.

### Issue: "Permission denied" error
**Solution**: Check that the RLS policies were created correctly in the SQL script

## Database Schema Overview

- **groups**: User-created groups to organize people
- **people**: Individual customers/people with borrowing history
- **contacts**: Phone numbers and contact info for people
- **documents**: File uploads and documents for people
- **transactions**: Borrowing and payment records

## Row Level Security

The app uses RLS to ensure users can only access their own data:
- Each table has a `user_id` field
- RLS policies restrict access based on `auth.uid()`
- Users can only see/modify data they created

## Next Steps

After setting up the database:
1. Test adding groups and people
2. Add some sample transactions
3. Test the balance calculations
4. Verify the search and filtering works

If you encounter any issues, check the browser console for detailed error messages that will help identify the problem.
