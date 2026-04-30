import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config()

import passport from './lib/passport.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './modules/identity/auth.routes.js'
import electionRoutes from './modules/governance/elections.routes.js'
import governanceRoutes from './modules/governance/governance.routes.js'
import campusOpsRoutes from './modules/campus-ops/campus-ops.routes.js'
import identityRoutes from './modules/identity/identity.routes.js'

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
})

// Core middleware
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use('/api', campusOpsRoutes)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/elections', electionRoutes)
app.use('/api', governanceRoutes)
app.use('/api', identityRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusChain API is running' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})