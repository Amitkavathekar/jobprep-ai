import express, { Express, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app: Express = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

export default app
