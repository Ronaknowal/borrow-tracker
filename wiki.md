# Project Summary
The Borrow-Tracker project is a web-based application designed for shopkeepers to manage customer borrowing and lending transactions efficiently. It features an advanced authentication system, real-time cloud synchronization with Supabase, and comprehensive management tools for customers and transactions. The application aims to enhance financial interactions, allowing shopkeepers to effectively oversee customer accounts and maintain accurate records. Future enhancements may include a mobile application for increased accessibility.

# Project Module Description
The Borrow-Tracker application consists of several functional modules:
- **Authentication**: Manages user sign-up, login, and session management with improved error handling for Supabase connectivity.
- **Cloud Sync**: Provides real-time data synchronization across devices using Supabase.
- **User Profiles**: Handles personal information and transaction history for users.
- **Groups**: Organizes customers into groups for streamlined management.
- **Transactions**: Records and tracks borrowing and lending activities, including detailed history.

# Directory Tree
```
shadcn-ui/
├── README.md                # Project overview and documentation
├── components.json          # JSON configuration for UI components
├── eslint.config.js         # ESLint configuration for code linting
├── index.html               # Main HTML file for the application
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration for CSS processing
├── public/                  # Public assets
│   ├── favicon.svg          # Application favicon
│   └── robots.txt           # Robots.txt for SEO
├── src/                     # Source code for the application
│   ├── App.css              # Main application styles
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components
│   ├── contexts/            # Context providers for state management
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility functions and libraries
│   │   ├── auth.ts          # User authentication functions
│   │   ├── database.ts      # Database operations for managing records
│   │   ├── supabase.ts      # Supabase client configuration
│   │   └── utils.ts         # Original utility functions
│   ├── pages/               # Application pages
│   └── types/               # Type definitions
├── tailwind.config.ts       # Tailwind CSS configuration
├── template_config.json      # Template configuration
├── todo.md                  # TODO list for future features
├── tsconfig.*.json          # TypeScript configuration files
└── vite.config.ts           # Vite configuration for the build process
```

# File Description Inventory
- **README.md**: Overview and setup instructions for the project.
- **package.json**: Lists project dependencies and scripts for building and running the application.
- **src/**: Contains the core application code, including components, pages, and styles.
- **public/**: Houses static assets like images and favicons.
- **tailwind.config.ts**: Configuration file for Tailwind CSS, used for styling.
- **lib/auth.ts**: Manages user authentication, including sign-up, sign-in, and password reset functionalities.
- **lib/supabase.ts**: Configures Supabase client and manages connection setup.
- **lib/database.ts**: Contains database operations for managing groups, people, contacts, and transactions.

# Technology Stack
- **React**: JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Build tool for modern web applications.
- **PostCSS**: Tool for transforming CSS with JavaScript plugins.
- **ESLint**: Tool for identifying and fixing problems in JavaScript code.
- **Supabase**: Backend-as-a-Service for real-time database and authentication.

# Usage
To set up the project:
1. Install dependencies using npm or yarn.
2. Build the project using the build script defined in `package.json`.
3. Run the application using the start script defined in `package.json`.
