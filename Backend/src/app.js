import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes.js'
import resumeRouter from './routes/resume.routes.js'
import roadmapRouter from './routes/roadmap.routes.js'
import jobDescriptionRouter from './routes/jobdescription.routes.js'
import interviewResultRouter from './routes/interviewResult.routes.js'
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())



//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/resumes", resumeRouter)
app.use("/api/v1/roadmaps", roadmapRouter)
app.use("/api/v1/job-descriptions", jobDescriptionRouter)
app.use("/api/v1/interview-results", interviewResultRouter)

// global error handler
app.use(errorHandler)

export { app }
