# Borrow-Tracker App - MVP Implementation Plan

## Core Features to Implement

### 1. Authentication System
- Login/Signup with email and password
- Password reset functionality
- Protected routes
- User session management

### 2. Database Schema (Supabase)
- Users table (handled by Supabase Auth)
- Groups table
- People table
- Contacts table
- Documents table
- Transactions table

### 3. Main Pages/Components
- **AuthPage.tsx** - Login/Signup form
- **HomePage.tsx** - Main dashboard with groups and people
- **GroupPage.tsx** - View people within a group
- **PersonProfile.tsx** - Detailed person view with transactions
- **AddPersonDialog.tsx** - Form to add new person
- **AddGroupDialog.tsx** - Form to add new group
- **TransactionDialog.tsx** - Add borrowed/paid transactions
- **SearchPage.tsx** - Search functionality

### 4. Key Components
- **PersonCard.tsx** - Display person info with balance and last payment
- **TransactionList.tsx** - Show transaction history
- **ContactList.tsx** - Manage person contacts
- **DocumentUpload.tsx** - Handle document uploads

### 5. Core Functionality
- CRUD operations for groups, people, transactions
- Real-time balance calculations
- Last payment tracking
- Search by name/phone
- Sort by various criteria
- File upload for photos and documents

## File Structure
```
src/
├── components/
│   ├── auth/
│   │   └── AuthPage.tsx
│   ├── dialogs/
│   │   ├── AddPersonDialog.tsx
│   │   ├── AddGroupDialog.tsx
│   │   └── TransactionDialog.tsx
│   ├── person/
│   │   ├── PersonCard.tsx
│   │   ├── PersonProfile.tsx
│   │   ├── ContactList.tsx
│   │   └── DocumentUpload.tsx
│   └── transactions/
│       └── TransactionList.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── GroupPage.tsx
│   └── SearchPage.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── database.ts
└── types/
    └── index.ts
```

## Implementation Priority
1. Set up Supabase configuration and database schema
2. Create authentication system
3. Build main home page with person cards
4. Add person profile and transaction management
5. Implement groups functionality
6. Add search and sorting features
7. Handle file uploads for photos and documents