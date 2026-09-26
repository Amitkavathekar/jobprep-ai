# shadcn/ui monorepo template

This is a Next.js monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Naming conventions

Use these conventions for new code across `apps/` and `packages/`. Keep existing names unless a change is explicitly requested.

### Code identifiers

- **React components and classes:** PascalCase, for example `ResumeEditor` and `AuthService`.
- **Functions, methods, variables, and parameters:** camelCase, for example `getUser`, `createResume`, `userData`, and `resumeId`.
- **Types, interfaces, and enums:** PascalCase, for example `User`, `Resume`, and `ApiResponse<T>`. Use a `Props` suffix for component props, such as `ResumeCardProps`.
- **Constants:** UPPER_SNAKE_CASE for values that are genuine shared constants or configuration, such as `API_URL` and `MAX_FILE_SIZE`. Use camelCase for ordinary local variables, even when declared with `const`.
- **Boolean identifiers:** Prefer clear prefixes such as `is`, `has`, `can`, or `should`, for example `isLoading` and `hasAccess`.
- **Event handlers and callbacks:** Use `handle` for component handlers and `on` for callback props, for example `handleSubmit` and `onSubmit`.
- Prefer descriptive names; avoid unclear abbreviations. Keep acronyms in types and identifiers readable, for example `ApiResponse` and `userId`.

### Files and folders

- **React component files:** PascalCase with a `.tsx` extension, for example `ResumeCard.tsx`.
- **Hooks:** Start the exported function with `use` and use camelCase, for example `useAuth`. Name the file `use-auth.ts`.
- **Other TypeScript modules:** Use kebab-case filenames, for example `api-client.ts`, `auth-schema.ts`, and `resume-service.ts`.
- **Folders:** Use lowercase kebab-case, for example `resume-editor/` and `interview-prep/`. Keep package and workspace names lowercase kebab-case as well.
- **Tests:** Keep the related name and add `.test` or `.spec` before the extension, for example `resume-service.test.ts` or `ResumeCard.test.tsx`.
- **Styles:** Name CSS modules after their component, for example `ResumeCard.module.css`.

### Next.js routes

- Keep Next.js special filenames exactly as required: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, and other framework-defined names.
- Use lowercase kebab-case for static URL segments, for example `forgot-password/`.
- Use Next.js dynamic segment syntax unchanged, for example `[resumeId]/`; use `[...slug]/` or `[[...slug]]/` for catch-all segments when needed.
- Keep route groups in parentheses, for example `(auth)/` and `(dashboard)/`.
- Name route parameters in camelCase, for example `[resumeId]`.

### Backend and shared code

- Use lowercase kebab-case for module and feature folders, for example `ai-analysis/` and `mock-interview/`.
- Name backend files with a kebab-case domain and a clear role suffix, such as `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`, and `auth.schema.ts`.
- Use PascalCase for classes and exported types; use camelCase for functions and values, including service methods and route handlers.
- Name validation schemas with a domain plus `Schema`, such as `create-resume.schema.ts` for the file and `createResumeSchema` for the exported schema value.
- Use PascalCase singular nouns for data model types, such as `User` and `Resume`; use camelCase for document and API fields, such as `userId` and `createdAt`.
- Use UPPER_SNAKE_CASE for environment variable names, for example `MONGODB_URI` and `JWT_SECRET`.
- Keep API response and request types explicit and PascalCase, for example `ApiResponse<T>`, `CreateResumeRequest`, and `ResumeResponse`.
