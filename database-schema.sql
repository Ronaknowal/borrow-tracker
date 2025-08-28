-- Database Schema for Borrow Tracker App
-- Run this in your Supabase SQL Editor

-- Note: This schema creates all necessary tables with Row Level Security (RLS)
-- No special database parameters are needed

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create people table
CREATE TABLE IF NOT EXISTS people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    dob DATE,
    address TEXT,
    photo TEXT,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_paid_date TIMESTAMP WITH TIME ZONE,
    last_paid_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    tag TEXT DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    file_data TEXT, -- Base64 encoded file data (for small files) or storage URL
    storage_path TEXT, -- Path in Supabase Storage (for large files)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('borrowed', 'paid')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_group_id ON people(group_id);
CREATE INDEX IF NOT EXISTS idx_contacts_person_id ON contacts(person_id);
CREATE INDEX IF NOT EXISTS idx_documents_person_id ON documents(person_id);
CREATE INDEX IF NOT EXISTS idx_transactions_person_id ON transactions(person_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for groups
CREATE POLICY "Users can view their own groups" ON groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups" ON groups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups" ON groups
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for people
CREATE POLICY "Users can view their own people" ON people
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own people" ON people
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people" ON people
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people" ON people
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contacts
CREATE POLICY "Users can view contacts of their people" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = contacts.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contacts for their people" ON contacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = contacts.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update contacts of their people" ON contacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = contacts.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete contacts of their people" ON contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = contacts.person_id 
            AND people.user_id = auth.uid()
        )
    );

-- Create RLS policies for documents
CREATE POLICY "Users can view documents of their people" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = documents.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their people" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = documents.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents of their people" ON documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = documents.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents of their people" ON documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = documents.person_id 
            AND people.user_id = auth.uid()
        )
    );

-- Create RLS policies for transactions
CREATE POLICY "Users can view transactions of their people" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = transactions.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions for their people" ON transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = transactions.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transactions of their people" ON transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = transactions.person_id 
            AND people.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transactions of their people" ON transactions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM people 
            WHERE people.id = transactions.person_id 
            AND people.user_id = auth.uid()
        )
    );

-- Create a function to calculate person balance
CREATE OR REPLACE FUNCTION calculate_person_balance(person_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_borrowed DECIMAL(10,2) := 0;
    total_paid DECIMAL(10,2) := 0;
BEGIN
    -- Calculate total borrowed
    SELECT COALESCE(SUM(amount), 0) INTO total_borrowed
    FROM transactions
    WHERE person_id = person_uuid AND type = 'borrowed';
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM transactions
    WHERE person_id = person_uuid AND type = 'paid';
    
    RETURN total_borrowed - total_paid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for people with calculated balance
CREATE OR REPLACE VIEW people_with_balance AS
SELECT 
    p.*,
    COALESCE(calculate_person_balance(p.id), 0) as balance
FROM people p;

-- Note: Supabase automatically handles permissions for authenticated users
-- The RLS policies will control access to the data
