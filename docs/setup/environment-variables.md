# Environment Variables

The backend loads environment values with dotenv and validates them at startup. Put local backend values in `apps/backend/.env`. Do not commit secrets.

| Variable                | Default                                | Purpose                                                                  |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `PORT`                  | `5000`                                 | Backend HTTP port                                                        |
| `NODE_ENV`              | `development`                          | Runtime mode: development, production, or test                           |
| `MONGODB_URI`           | `mongodb://127.0.0.1:27017/jobprep-ai` | MongoDB connection string                                                |
| `JWT_SECRET`            | Development placeholder                | JWT signing secret; use a strong private value outside local development |
| `JWT_EXPIRES_IN`        | `7d`                                   | JWT lifetime                                                             |
| `CORS_ORIGIN`           | `http://localhost:3000`                | Allowed frontend origin                                                  |
| `GEMINI_API_KEY`        | Empty                                  | Gemini API key for AI features                                           |
| `CLOUDINARY_CLOUD_NAME` | Empty                                  | Cloudinary account name                                                  |
| `CLOUDINARY_API_KEY`    | Empty                                  | Cloudinary API key                                                       |
| `CLOUDINARY_API_SECRET` | Empty                                  | Cloudinary API secret                                                    |
| `SMTP_HOST`             | Empty                                  | SMTP server hostname                                                     |
| `SMTP_PORT`             | `587`                                  | SMTP server port                                                         |
| `SMTP_USER`             | Empty                                  | SMTP username                                                            |
| `SMTP_PASS`             | Empty                                  | SMTP password                                                            |
| `FROM_EMAIL`            | `noreply@jobprep.ai`                   | Sender address                                                           |

The root `.env.example` is currently empty. This table reflects `apps/backend/src/config/env.ts`; frontend-specific environment variables are not listed here because they are not defined by that backend schema.
