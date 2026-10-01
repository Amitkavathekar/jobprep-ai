jobprep-ai-code/
|-- .env.example                                      → Example environment variables for the pr
|-- .eslintrc.js                                      → ESLint rules for code quality.
|-- .gitignore                                        → Files and folders that Git should ignore.
|-- .prettierignore                                   → Files and folders that Prettier should ig
|-- .prettierrc                                       → Prettier formatting configuration.
|-- package-lock.json                                 → Locks exact npm dependency versions.
|-- package.json                                      → Root project configuration and scripts.
|-- README.md                                         → Main project documentation.
|-- tsconfig.json                                     → Root TypeScript configuration.
|-- turbo.json                                        → Turborepo configuration.

|-- apps/                                             → Contains the main applications.
|   |-- backend/                                      → Backend API application.
|   |   |-- .env                                      → Local backend secrets and environment var
|   |   |-- package.json                              → Backend dependencies and scripts.
|   |   |-- tsconfig.json                             → Backend TypeScript configuration.
|   |   `-- src/                                      → Backend source code.
|   |       |-- app.ts                                → Creates and configures the Express app.
|   |       |-- server.ts                             → Starts the backend server.

|   |       |-- config/                               → Backend application configurations.
|   |       |   |-- cors.config.ts                    → Configures CORS settings.
|   |       |   |-- database.ts                       → Connects the backend to MongoDB.
|   |       |   |-- env.ts                            → Loads and manages environment variables.
|   |       |   |-- groq.config.ts                    → Configures Groq AI.
|   |       |   `-- logger.ts                          → Configures application logging.

|   |       |-- constants/                            → Stores fixed values used in the backend.
|   |       |   |-- http-status.ts                    → Stores HTTP status codes.
|   |       |   |-- response-messages.ts              → Stores common API response messages.
|   |       |   `-- roles.ts                           → Defines user roles.

|   |       |-- errors/                               → Contains custom API error classes.
|   |       |   |-- ApiError.ts                       → Base custom API error class.
|   |       |   |-- BadRequestError.ts                → Handles bad request errors.
|   |       |   |-- ForbiddenError.ts                 → Handles forbidden access errors.
|   |       |   |-- NotFoundError.ts                  → Handles resource not found errors.
|   |       |   `-- UnauthorizedError.ts              → Handles unauthorized access errors.

|   |       |-- middlewares/                          → Contains Express middleware.
|   |       |   |-- auth.middleware.ts                → Checks user authentication.
|   |       |   |-- error.middleware.ts               → Handles API errors.
|   |       |   |-- rate-limit.middleware.ts          → Limits repeated API requests.
|   |       |   |-- role.middleware.ts                → Checks user roles and permissions.
|   |       |   |-- upload.middleware.ts              → Handles file uploads.
|   |       |   `-- validate.middleware.ts            → Validates request data.

|   |       |-- modules/                              → Contains backend business modules.
|   |       |   |-- admin/                            → Handles Admin functionality.
|   |       |   |   |-- admin.controller.ts           → Handles Admin API requests.
|   |       |   |   |-- admin.routes.ts                → Defines Admin API routes.
|   |       |   |   `-- admin.service.ts               → Contains Admin business logic.

|   |       |   |-- ai-analysis/                      → Handles AI analysis functionality.
|   |       |   |   |-- ai-analysis.controller.ts     → Handles AI analysis requests.
|   |       |   |   |-- ai-analysis.model.ts          → Defines AI analysis MongoDB model.
|   |       |   |   |-- ai-analysis.routes.ts         → Defines AI analysis API routes.
|   |       |   |   `-- ai-analysis.service.ts        → Contains AI analysis business logic.

|   |       |   |-- ats/                              → Handles ATS analysis functionality.
|   |       |   |   |-- ats.controller.ts             → Handles ATS API requests.
|   |       |   |   |-- ats.model.ts                  → Defines ATS MongoDB model.
|   |       |   |   |-- ats.routes.ts                 → Defines ATS API routes.
|   |       |   |   |-- ats.service.ts                → Contains ATS business logic.
|   |       |   |   `-- ats.validation.ts             → Validates ATS request data.

|   |       |   |-- auth/                             → Handles authentication functionality.
|   |       |   |   |-- auth.controller.ts            → Handles authentication requests.
|   |       |   |   |-- auth.model.ts                 → Defines authentication MongoDB model.
|   |       |   |   |-- auth.routes.ts                → Defines authentication API routes.
|   |       |   |   |-- auth.service.ts               → Contains authentication business logic.
|   |       |   |   `-- auth.validation.ts            → Validates authentication data.

|   |       |   |-- mock-interview/                   → Handles mock interview functionality.
|   |       |   |   |-- mock.controller.ts            → Handles mock interview requests.
|   |       |   |   |-- mock.model.ts                 → Defines mock interview MongoDB model.
|   |       |   |   |-- mock.routes.ts                → Defines mock interview API routes.
|   |       |   |   `-- mock.service.ts               → Contains mock interview business logic.

|   |       |   |-- payments/                         → Handles payment functionality.
|   |       |   |   |-- payment.model.ts              → Defines payment MongoDB model.
|   |       |   |   |-- payments.controller.ts        → Handles payment API requests.
|   |       |   |   |-- payments.routes.ts            → Defines payment API routes.
|   |       |   |   `-- payments.service.ts           → Contains payment business logic.

|   |       |   |-- reports/                          → Handles report functionality.
|   |       |   |   |-- reports.controller.ts         → Handles report API requests.
|   |       |   |   |-- reports.routes.ts             → Defines report API routes.
|   |       |   |   `-- reports.service.ts            → Contains report business logic.

|   |       |   |-- resume/                           → Handles resume functionality.
|   |       |   |   |-- resume.controller.ts          → Handles resume API requests.
|   |       |   |   |-- resume.model.ts               → Defines resume MongoDB model.
|   |       |   |   |-- resume.routes.ts              → Defines resume API routes.
|   |       |   |   `-- resume.service.ts             → Contains resume business logic.

|   |       |   |-- subscriptions/                    → Handles subscription functionality.
|   |       |   |   |-- subscription.model.ts        → Defines subscription MongoDB model.
|   |       |   |   |-- subscriptions.controller.ts  → Handles subscription API requests.
|   |       |   |   |-- subscriptions.routes.ts      → Defines subscription API routes.
|   |       |   |   `-- subscriptions.service.ts      → Contains subscription business logic.

|   |       |   `-- users/                            → Handles user functionality.
|   |       |       |-- user.controller.ts            → Handles user API requests.
|   |       |       |-- user.interface.ts             → Defines backend User interfaces.
|   |       |       |-- user.model.ts                 → Defines User MongoDB model.
|   |       |       |-- user.routes.ts                → Defines User API routes.
|   |       |       `-- user.service.ts               → Contains User business logic.

|   |       |-- routes/                               → Contains central API route configuration.
|   |       |   `-- index.ts                          → Registers all application routes.

|   |       |-- services/                             → Contains reusable backend services.
|   |       |   |-- email.service.ts                  → Handles email sending.
|   |       |   |-- gemini.service.ts                 → Handles Gemini AI operations.
|   |       |   |-- pdf-parser.service.ts             → Extracts data from PDF files.
|   |       |   `-- storage.service.ts                → Handles file storage operations.

|   |       `-- shared/                               → Contains reusable backend code.
|   |           |-- types/                            → Contains shared backend types.
|   |           |   `-- user.entity.ts                → Defines reusable User entity/type.
|   |           `-- utils/                            → Contains reusable utility functions.
|   |               |-- apiResponse.ts                → Provides a standard API response format.
|   |               |-- asyncHandler.ts               → Handles async controller errors.
|   |               `-- jwt.utils.ts                  → Handles JWT creation and verification.

|   `-- frontend/                                     → Frontend application built with Next.js.
|       |-- .env.example                              → Example frontend environment variables.
|       |-- components.json                            → shadcn/ui configuration.
|       |-- eslint.config.js                          → Frontend ESLint configuration.
|       |-- next-env.d.ts                             → Next.js TypeScript declarations.
|       |-- next.config.ts                            → Next.js application configuration.
|       |-- package.json                              → Frontend dependencies and scripts.
|       |-- postcss.config.mjs                        → PostCSS configuration.
|       |-- tsconfig.json                             → Frontend TypeScript configuration.
|       |-- tsconfig.tsbuildinfo                      → TypeScript build cache information.
|       |-- public/                                   → Contains public static files.
|       |   `-- icon.svg                              → Application SVG icon.

|       `-- src/                                     → Frontend source code.
|           |-- app/                                 → Next.js App Router pages and layouts.
|           |   |-- error.tsx                         → Handles application errors.
|           |   |-- layout.tsx                        → Root application layout.
|           |   |-- not-found.tsx                     → Handles 404 pages.
|           |   |-- page.tsx                          → Main application page.

|           |   |-- (protected)/                      → Contains protected authenticated pages.
|           |   |   |-- admin/                        → Contains Admin pages.
|           |   |   |   |-- layout.tsx                → Admin common layout.
|           |   |   |   |-- page.tsx                  → Admin dashboard page.
|           |   |   |   |-- ai-models/page.tsx        → AI model management page.
|           |   |   |   |-- coupons/page.tsx          → Coupon management page.
|           |   |   |   |-- notifications/page.tsx   → Notification management page.
|           |   |   |   |-- payments/page.tsx         → Payment management page.
|           |   |   |   |-- plans/page.tsx            → Subscription plan management page.
|           |   |   |   `-- roles-permissions/page.tsx → Role and permission management page.

|           |   |   `-- user/                         → Contains authenticated User pages.
|           |   |       |-- layout.tsx                → User common layout.
|           |   |       |-- ai-analysis/page.tsx      → AI analysis page.
|           |   |       |-- ats-analysis/page.tsx     → ATS analysis page.
|           |   |       |-- dashboard/page.tsx        → User dashboard page.
|           |   |       |-- interview-prep/page.tsx   → Interview preparation page.
|           |   |       |-- mock-interview/page.tsx   → Mock interview page.
|           |   |       |-- profile/page.tsx           → User profile page.
|           |   |       |-- reports/page.tsx           → User reports page.
|           |   |       |-- resume/page.tsx            → User resume page.
|           |   |       `-- support/page.tsx           → User support page.

|           `-- (public)/                             → Contains public pages.
|               |-- (auth)/                           → Contains authentication pages.
|               |   |-- forgot-password/page.tsx     → Forgot password page.
|               |   |-- login/page.tsx               → Login page.
|               |   `-- register/page.tsx             → Registration page.
|               `-- (marketing)/                      → Contains marketing pages.
|                   |-- about/page.tsx                → About page.
|                   `-- pricing/page.tsx              → Pricing page.

|           |-- components/                           → Contains reusable UI components.
|           |   |-- ThemeProvider.tsx                → Provides theme functionality.
|           |   |-- admin/AdminStats.tsx              → Displays Admin statistics.
|           |   |-- common/page.tsx                   → Common reusable UI/page.
|           |   |-- layout/                           → Contains layout components.
|           |   |   |-- AdminSidebar.tsx              → Admin sidebar navigation.
|           |   |   |-- Navbar.tsx                    → Common navigation bar.
|           |   |   `-- Sidebar.tsx                   → User sidebar navigation.
|           |   `-- resume/page.tsx                   → Resume-related reusable UI.

|           |-- features/                             → Contains feature-specific frontend code.
|           |   |-- ai-analysis/page.tsx              → AI analysis feature.
|           |   |-- ats-analysis/page.tsx             → ATS analysis feature.
|           |   |-- auth/page.tsx                     → Authentication feature.
|           |   |-- interview-prep/page.tsx           → Interview preparation feature.
|           |   |-- mock-interview/page.tsx           → Mock interview feature.
|           |   |-- profile/page.tsx                  → Profile feature.
|           |   |-- reports/page.tsx                  → Reports feature.
|           |   |-- resume/                           → Resume feature components.
|           |   |   |-- ResumeEditor.tsx              → Allows users to edit resumes.
|           |   |   |-- ResumePreview.tsx             → Displays resume preview.
|           |   |   `-- ResumeSection.tsx             → Displays a resume section.
|           |   |-- subscription/page.tsx             → Subscription feature.
|           |   `-- support/page.tsx                  → Support feature.

|           |-- hooks/                                → Contains reusable React hooks.
|           |   |-- useAuth.ts                        → Handles authentication-related React logic.
|           |   `-- useResume.ts                      → Handles resume-related React logic.

|           |-- lib/                                  → Contains frontend libraries and utilities.
|           |   |-- api-client.ts                     → Handles API communication.
|           |   |-- auth.ts                           → Contains authentication helpers.
|           |   |-- constants.ts                      → Stores frontend constants.
|           |   |-- query-client.ts                   → Configures query/data fetching.
|           |   `-- utils.ts                          → Contains reusable frontend utilities.

|           |-- providers/                            → Contains React providers.
|           |   `-- ThemeProvider.ts                  → Provides theme context.

|           `-- store/                               → Contains global application state.
|               |-- auth.store.ts                     → Stores authentication state.
|               `-- resume.store.ts                   → Stores resume state.

|-- docs/                                              → Contains project documentation.
|   |-- api/endpoints.md                               → Documents backend API endpoints.
|   |-- architecture/                                  → Contains architecture documentation.
|   |   |-- folder-struture.md                         → Documents the project folder structure.
|   |   `-- system-architecture.md                    → Documents overall system architecture.
|   |-- database/adminAnduserERD.png                   → Shows Admin and User database relationships.
|   |-- diagrams/                                      → Contains system diagrams.
|   |   |-- admin-dfd level 0,1,2.png                  → Admin Data Flow Diagrams.
|   |   `-- user dfd level 0,1,2.png                   → User Data Flow Diagrams.
|   |-- requirements/Job_Preparation_AI_Straight_to_Point_SRS.pdf → Project Software Requirements Specification.
|   `-- setup/                                         → Contains project setup documentation.
|       |-- deployment.md                              → Explains project deployment.
|       `-- environment-variables.md                  → Documents environment variables.

`-- packages/                                          → Contains reusable shared packages.
    |-- eslint-config/                                 → Shared ESLint configurations.
    |   |-- base.js                                    → Base ESLint rules.
    |   |-- next.js                                    → ESLint rules for Next.js.
    |   |-- package.json                               → ESLint package configuration.
    |   |-- react-internal.js                          → ESLint rules for internal React packages.
    |   `-- README.md                                  → ESLint package documentation.

    |-- types/                                         → Contains shared TypeScript types.
    |   |-- package.json                               → Types package configuration.
    |   `-- src/                                      → Shared type definitions.
    |       |-- ai.ts                                 → AI-related shared types.
    |       |-- aianlysis.ts                           → AI analysis shared types.
    |       |-- index.ts                               → Exports all shared types.
    |       |-- payment.ts                             → Payment-related shared types.
    |       |-- questions.ts                            → Question-related shared types.
    |       |-- reports.ts                             → Report-related shared types.
    |       |-- resume.ts                              → Resume-related shared types.
    |       `-- user.ts                                → User-related shared types.

    |-- typescript-config/                             → Shared TypeScript configurations.
    |   |-- base.json                                 → Base TypeScript configuration.
    |   |-- nextjs.json                               → Next.js TypeScript configuration.
    |   |-- package.json                              → TypeScript config package configuration.
    |   |-- react-library.json                         → React library TypeScript configuration.
    |   `-- README.md                                  → TypeScript configuration documentation.

    |-- ui/                                            → Contains reusable UI components.
    |   |-- components.json                            → UI component configuration.
    |   |-- eslint.config.js                           → UI package ESLint configuration.
    |   |-- package.json                               → UI package configuration.
    |   |-- postcss.config.mjs                         → UI package PostCSS configuration.
    |   |-- tsconfig.json                              → UI package TypeScript configuration.
    |   |-- tsconfig.lint.json                         → TypeScript configuration for linting.
    |   `-- src/                                      → UI package source code.
    |       |-- components/button.tsx                  → Reusable Button component.
    |       |-- lib/utils.ts                           → UI utility functions.
    |       `-- styles/globals.css                     → Shared global CSS styles.

    `-- validation/                                   → Contains shared validation schemas.
        |-- package.json                               → Validation package configuration.
        `-- src/                                      → Validation source code.
            |-- .gitkeep                              → Keeps the empty folder tracked by Git.
            |-- auth.schema.ts                         → Authentication validation schemas.
            |-- resume.schema.ts                       → Resume validation schemas.
            `-- user.schema.ts                         → User validation schemas.
