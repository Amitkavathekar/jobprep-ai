# System Architecture

JobPrep AI is a web application with a Next.js frontend, an Express REST API, and MongoDB persistence.

## Main Components

- **Frontend:** Next.js 16 and React 19, located in `apps/frontend`.
- **Backend:** Node.js, Express, and TypeScript, located in `apps/backend`.
- **Database:** MongoDB accessed through Mongoose.
- **External services:** Gemini AI, Cloudinary, SMTP email, and payment providers are represented in backend dependencies or configuration. Configure only the integrations used by the features you run.

The frontend communicates with the backend over HTTP. The API is mounted at `/api/v1`; the backend also exposes `/health` for health checks. Feature routes are grouped by domain, with shared middleware for CORS, JSON parsing, rate limiting, validation, authentication, and error handling.

See [monorepo architecture](monorepo-architecture.md), [folder structure](folder-structure.md), and the diagrams in `../diagrams/`.
