import express, { Express, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app: Express = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root Route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Welcome to JobPrep AI Backend API",
    healthCheck: "/health",
    apiHealthCheck: "/api/v1/health",
    timestamp: new Date().toISOString(),
  })
})

// Health Check Routes
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "JobPrep AI Backend API is running",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "JobPrep AI API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// 404 Fallback Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  })
})

export default app

