import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { corsConfig } from './config/cors.config.js';
import { globalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { NotFoundError } from './errors/NotFoundError.js';
import routes from './routes/index.js';

const app: Express = express();

// Global Middlewares
app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes mounting
app.use('/api/v1', routes);

// 404 Route Handler
app.use((_req: Request, _res: Response, next) => {
  next(new NotFoundError('The requested endpoint does not exist.'));
});

// Global Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;
