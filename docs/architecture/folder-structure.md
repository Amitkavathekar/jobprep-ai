jobprep-ai-code/                                      # Root folder of the JobPrep AI monorepo
|
|-- .env.example                                      # Example root environment variables
|-- .eslintrc.js                                      # Root ESLint rules and configuration
|-- .gitignore                                        # Files/folders Git should not track
|-- .prettierignore                                   # Files/folders Prettier should ignore
|-- .prettierrc                                       # Prettier code-formatting rules
|-- package-lock.json                                 # Locks exact npm dependency versions
|-- package.json                                      # Root scripts, workspaces and dependencies
|-- README.md                                         # Main project documentation
|-- tsconfig.json                                     # Root TypeScript configuration
|-- turbo.json                                        # Turborepo task configuration
|
|-- apps/                                             # Contains the main applications
|   |
|   |-- backend/                                      # Node.js + Express backend application
|   |   |
|   |   |-- .env                                      # Backend local secrets and environment variables
|   |   |-- .env.example                              # Example backend environment variables
|   |   |-- package.json                              # Backend dependencies and scripts
|   |   |-- tsconfig.json                             # Backend TypeScript configuration
|   |   |
|   |   `-- src/                                      # Backend source code
|   |       |
|   |       |-- app.ts                                # Creates/configures the Express application
|   |       |-- server.ts                             # Starts the backend server
|   |       |
|   |       |-- config/                               # Backend configuration
|   |       |   |-- cors.config.ts                    # Configures CORS
|   |       |   |-- database.ts                       # MongoDB database connection
|   |       |   |-- env.ts                            # Reads and validates environment variables
|   |       |   |-- groq.config.ts                    # Groq AI configuration
|   |       |   `-- logger.ts                         # Application logging configuration
|   |       |
|   |       |-- constants/                            # Fixed values used by backend
|   |       |   |-- http-status.ts                    # HTTP status code constants
|   |       |   |-- response-messages.ts              # Common API response messages
|   |       |   `-- roles.ts                          # User roles and role constants
|   |       |
|   |       |-- errors/                               # Custom application errors
|   |       |   |-- ApiError.ts                       # Base API error class
|   |       |   |-- BadRequestError.ts                # Handles bad request errors
|   |       |   |-- ForbiddenError.ts                 # Handles forbidden/permission errors
|   |       |   |-- NotFoundError.ts                  # Handles resource-not-found errors
|   |       |   `-- UnauthorizedError.ts              # Handles authentication errors
|   |       |
|   |       |-- middlewares/                          # Express middleware functions
|   |       |   |-- auth.middleware.ts                 # Checks user authentication
|   |       |   |-- error.middleware.ts               # Central error handling
|   |       |   |-- rate-limit.middleware.ts          # Limits excessive API requests
|   |       |   |-- role.middleware.ts                # Checks user roles/permissions
|   |       |   |-- upload.middleware.ts              # Handles file uploads
|   |       |   `-- validate.middleware.ts            # Validates incoming request data
|   |       |
|   |       |-- modules/                              # Backend features/modules
|   |       |   |
|   |       |   |-- admin/                            # Admin functionality
|   |       |   |   |-- admin.controller.ts           # Handles admin requests
|   |       |   |   |-- admin.routes.ts               # Admin API routes
|   |       |   |   `-- admin.service.ts              # Admin business logic
|   |       |   |
|   |       |   |-- ai-analysis/                      # AI resume analysis functionality
|   |       |   |   |-- ai-analysis.controller.ts     # Handles AI analysis requests
|   |       |   |   |-- ai-analysis.model.ts          # AI analysis database model
|   |       |   |   |-- ai-analysis.routes.ts         # AI analysis API routes
|   |       |   |   `-- ai-analysis.service.ts        # AI analysis business logic
|   |       |   |
|   |       |   |-- ats/                              # ATS analysis functionality
|   |       |   |   |-- ats.controller.ts             # Handles ATS requests
|   |       |   |   |-- ats.model.ts                  # ATS database model
|   |       |   |   |-- ats.routes.ts                 # ATS API routes
|   |       |   |   |-- ats.service.ts                # ATS business logic
|   |       |   |   `-- ats.validation.ts             # ATS input validation
|   |       |   |
|   |       |   |-- auth/                             # Authentication functionality
|   |       |   |   |-- auth.controller.ts            # Handles login/register requests
|   |       |   |   |-- auth.model.ts                 # Authentication/user database model
|   |       |   |   |-- auth.routes.ts                # Authentication API routes
|   |       |   |   |-- auth.service.ts               # Authentication business logic
|   |       |   |   `-- auth.validation.ts            # Login/register validation
|   |       |   |
|   |       |   |-- mock-interview/                   # Mock interview functionality
|   |       |   |   |-- mock.controller.ts            # Handles mock interview requests
|   |       |   |   |-- mock.model.ts                 # Mock interview database model
|   |       |   |   |-- mock.routes.ts                # Mock interview API routes
|   |       |   |   `-- mock.service.ts               # Mock interview business logic
|   |       |   |
|   |       |   |-- payments/                         # Payment functionality
|   |       |   |   |-- payment.model.ts              # Payment database model
|   |       |   |   |-- payments.controller.ts        # Handles payment requests
|   |       |   |   |-- payments.routes.ts             # Payment API routes
|   |       |   |   `-- payments.service.ts            # Payment business logic
|   |       |   |
|   |       |   |-- reports/                          # Reports functionality
|   |       |   |   |-- reports.controller.ts         # Handles report requests
|   |       |   |   |-- reports.routes.ts              # Report API routes
|   |       |   |   `-- reports.service.ts             # Report business logic
|   |       |   |
|   |       |   |-- resume/                           # Resume functionality
|   |       |   |   |-- resume.controller.ts          # Handles resume requests
|   |       |   |   |-- resume.model.ts               # Resume database model
|   |       |   |   |-- resume.routes.ts               # Resume API routes
|   |       |   |   `-- resume.service.ts             # Resume business logic
|   |       |   |
|   |       |   |-- subscriptions/                    # Subscription functionality
|   |       |   |   |-- subscription.model.ts         # Subscription database model
|   |       |   |   |-- subscriptions.controller.ts   # Handles subscription requests
|   |       |   |   |-- subscriptions.routes.ts       # Subscription API routes
|   |       |   |   `-- subscriptions.service.ts      # Subscription business logic
|   |       |   |
|   |       |   `-- users/                            # User functionality
|   |       |       |-- user.controller.ts            # Handles user requests
|   |       |       |-- user.interface.ts             # User TypeScript interface
|   |       |       |-- user.model.ts                 # User database model
|   |       |       |-- user.routes.ts                # User API routes
|   |       |       `-- user.service.ts               # User business logic
|   |       |
|   |       |-- routes/                               # Main API route registration
|   |       |   `-- index.ts                          # Registers all module routes
|   |       |
|   |       |-- services/                             # Shared backend services
|   |       |   |-- email.service.ts                  # Sends emails
|   |       |   |-- gemini.service.ts                 # Gemini AI integration
|   |       |   |-- pdf-parser.service.ts             # Reads/parses PDF files
|   |       |   `-- storage.service.ts                # Handles file/storage operations
|   |       |
|   |       `-- shared/                               # Shared backend utilities/types
|   |           |-- types/
|   |           |   `-- express.d.ts                  # Extends Express TypeScript types
|   |           |
|   |           `-- utils/
|   |               |-- apiResponse.ts                # Standard API response helper
|   |               |-- asyncHandler.ts                # Handles async route errors
|   |               `-- jwt.utils.ts                  # JWT token helper functions
|   |
|   `-- frontend/                                     # Next.js + TypeScript frontend
|       |
|       |-- .env.example                              # Example frontend environment variables
|       |-- .env.local                                # Local frontend environment variables
|       |-- components.json                            # shadcn/ui configuration
|       |-- eslint.config.js                           # Frontend ESLint configuration
|       |-- next-env.d.ts                              # Next.js generated TypeScript declarations
|       |-- next.config.ts                             # Next.js configuration
|       |-- package.json                               # Frontend dependencies and scripts
|       |-- postcss.config.mjs                         # PostCSS/Tailwind configuration
|       |-- tsconfig.json                              # Frontend TypeScript configuration
|       |
|       |-- public/                                    # Static public files
|       |   `-- icon.svg                               # Application icon
|       |
|       `-- src/                                      # Frontend source code
|           |
|           |-- app/                                  # Next.js App Router
|           |   |
|           |   |-- error.tsx                          # Global application error UI
|           |   |-- layout.tsx                         # Root application layout
|           |   |-- not-found.tsx                      # Custom 404 page
|           |   |
|           |   |-- (protected)/                       # Routes requiring authentication
|           |   |   |
|           |   |   |-- admin/                         # Admin dashboard routes
|           |   |   |   |-- layout.tsx                 # Admin layout
|           |   |   |   |-- page.tsx                   # Admin dashboard page
|           |   |   |   |-- ai-models/page.tsx         # AI model management page
|           |   |   |   |-- coupons/page.tsx           # Coupon management page
|           |   |   |   |-- notifications/page.tsx     # Notification management page
|           |   |   |   |-- payments/page.tsx          # Payment management page
|           |   |   |   |-- plans/page.tsx             # Subscription plans page
|           |   |   |   `-- roles-permissions/page.tsx # Roles and permissions page
|           |   |
|           |   |   `-- user/                          # User dashboard routes
|           |   |       |-- layout.tsx                 # User area layout
|           |   |       |-- ai-analysis/page.tsx       # AI analysis page
|           |   |       |-- ats-analysis/page.tsx      # ATS analysis page
|           |   |       |-- dashboard/page.tsx         # User dashboard page
|           |   |       |-- interview-prep/page.tsx    # Interview preparation page
|           |   |       |-- mock-interview/page.tsx    # Mock interview page
|           |   |       |-- profile/page.tsx            # User profile page
|           |   |       |-- reports/page.tsx            # User reports page
|           |   |       |-- resume/page.tsx             # Resume list/page
|           |   |       |   `-- [resumeId]/page.tsx    # Dynamic page for one resume
|           |   |       `-- support/page.tsx             # User support page
|           |
|           |   `-- (public)/                           # Public routes
|           |       |
|           |       |-- (auth)/                         # Authentication pages
|           |       |   |-- forgot-password/page.tsx   # Forgot password page
|           |       |   |-- login/page.tsx             # Login page
|           |       |   `-- register/page.tsx          # Registration page
|           |       |
|           |       `-- (marketing)/                    # Marketing/public pages
|           |           |-- page.tsx                    # Homepage
|           |           |-- about/page.tsx              # About page
|           |           `-- pricing/page.tsx            # Pricing page
|           |
|           |-- components/                            # Reusable frontend UI components
|           |   |
|           |   |-- ThemeProvider.tsx                  # Theme provider component
|           |   |-- admin/
|           |   |   `-- AdminStats.tsx                 # Admin statistics component
|           |   |-- common/
|           |   |   `-- page.tsx                       # Temporary placeholder file
|           |   |-- layout/
|           |   |   |-- AdminSidebar.tsx               # Admin sidebar
|           |   |   |-- Navbar.tsx                     # Main navigation bar
|           |   |   `-- Sidebar.tsx                    # General sidebar
|           |   `-- resume/
|           |       `-- page.tsx                       # Temporary placeholder file
|           |
|           |-- features/                              # Feature-specific frontend code
|           |   |
|           |   |-- ai-analysis/page.tsx               # Temporary feature placeholder
|           |   |-- ats-analysis/page.tsx              # Temporary feature placeholder
|           |   |-- auth/page.tsx                      # Temporary feature placeholder
|           |   |-- interview-prep/page.tsx            # Temporary feature placeholder
|           |   |-- mock-interview/page.tsx            # Temporary feature placeholder
|           |   |-- profile/page.tsx                   # Temporary feature placeholder
|           |   |-- reports/page.tsx                   # Temporary feature placeholder
|           |   |-- resume/
|           |   |   |-- ResumeEditor.tsx               # Resume editor component
|           |   |   |-- ResumePreview.tsx              # Resume preview component
|           |   |   `-- ResumeSection.tsx              # Resume section component
|           |   |-- subscription/page.tsx              # Temporary feature placeholder
|           |   `-- support/page.tsx                   # Temporary feature placeholder
|           |
|           |-- hooks/                                 # Custom React hooks
|           |   |-- useAuth.ts                         # Authentication hook
|           |   `-- useResume.ts                       # Resume-related hook
|           |
|           |-- lib/                                   # Frontend utilities and configuration
|           |   |-- api-client.ts                      # API client for backend requests
|           |   |-- auth.ts                            # Frontend authentication helpers
|           |   |-- constants.ts                       # Frontend constants
|           |   |-- query-client.ts                    # TanStack Query configuration
|           |   `-- utils.ts                           # General utility functions
|           |
|           |-- providers/                             # React context providers
|           |   `-- ThemeProvider.ts                   # Theme provider setup
|           |
|           `-- store/                                 # Global frontend state
|               |-- auth.store.ts                      # Authentication state
|               `-- resume.store.ts                    # Resume state
|
|
|-- docs/                                               # Project documentation
|   |
|   |-- api/                                            # API documentation
|   |   `-- endpoints.md                                # List and explanation of API endpoints
|   |
|   |-- architecture/                                  # Architecture documentation
|   |   |-- folder-structure.md                         # Explains the project folder structure
|   |   `-- system-architecture.md                     # Explains overall system architecture
|   |
|   |-- database/                                      # Database documentation
|   |   `-- adminAnduserERD.png                         # Entity Relationship Diagram
|   |
|   |-- diagrams/                                      # System/process diagrams
|   |   |-- admin-dfd level 0,1,2.png                  # Admin Data Flow Diagrams
|   |   `-- user dfd level 0,1,2.png                   # User Data Flow Diagrams
|   |
|   |-- requirements/                                  # Project requirement documents
|   |   `-- Job_Preparation_AI_Straight_to_Point_SRS.pdf # Software Requirements Specification
|   |
|   `-- setup/                                         # Setup and deployment documentation
|       |-- deployment.md                               # Deployment instructions
|       `-- environment-variables.md                   # Environment variable documentation
|
|
`-- packages/                                           # Shared packages for frontend/backend
    |
    |-- eslint-config/                                  # Shared ESLint configuration
    |   |-- base.js                                     # Base ESLint rules
    |   |-- next.js                                     # Next.js ESLint rules
    |   |-- package.json                                # ESLint package configuration
    |   |-- react-internal.js                           # React internal ESLint rules
    |   `-- README.md                                   # ESLint configuration documentation
    |
    |-- types/                                          # Shared TypeScript types
    |   |-- package.json                                # Types package configuration
    |   `-- src/
    |       |-- api.ts                                  # Shared API types
    |       |-- ats.ts                                  # Shared ATS types
    |       |-- interview.ts                            # Shared interview types
    |       |-- resume.ts                               # Shared resume types
    |       `-- user.ts                                 # Shared user types
    |
    |-- typescript-config/                              # Shared TypeScript configurations
    |   |-- base.json                                   # Base TypeScript configuration
    |   |-- nextjs.json                                 # Next.js TypeScript configuration
    |   |-- package.json                                # TypeScript config package
    |   |-- react-library.json                          # React library TypeScript configuration
    |   `-- README.md                                   # TypeScript configuration documentation
    |
    |-- ui/                                             # Shared UI component package
    |   |-- components.json                             # UI/shadcn configuration
    |   |-- eslint.config.js                            # UI package ESLint configuration
    |   |-- package.json                                # UI package dependencies and scripts
    |   |-- postcss.config.mjs                          # UI package PostCSS configuration
    |   |-- tsconfig.json                               # UI package TypeScript configuration
    |   |-- tsconfig.lint.json                          # TypeScript configuration for linting
    |   `-- src/
    |       |-- components/
    |       |   |-- .gitkeep                            # Keeps an empty folder in Git
    |       |   `-- button.tsx                           # Shared Button component
    |       |
    |       |-- hooks/
    |       |   `-- .gitkeep                            # Keeps an empty hooks folder in Git
    |       |
    |       |-- lib/
    |       |   |-- .gitkeep                            # Keeps an empty folder in Git
    |       |   `-- utils.ts                            # Shared UI utility functions
    |       |
    |       `-- styles/
    |           |-- .gitkeep                            # Keeps an empty folder in Git
    |           `-- globals.css                         # Shared global styles
    |
    `-- validation/                                    # Shared validation package
        |-- package.json                                # Validation package configuration
        `-- src/
            |-- .gitkeep                                # Keeps the package folder in Git
            |-- auth.schema.ts                          # Authentication validation schemas
            |-- resume.schema.ts                        # Resume validation schemas
            `-- user.schema.ts                          # User validation schemas
