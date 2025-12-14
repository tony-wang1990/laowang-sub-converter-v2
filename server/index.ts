
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import convertRouter from './routes/convert.js'
import shortlinkRouter from './routes/shortlink.js'
import subscriptionRouter from './routes/subscriptions.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api/convert', convertRouter)
app.use('/api/shortlink', shortlinkRouter)
app.use('/api/subscriptions', subscriptionRouter)
app.use('/s', shortlinkRouter)

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')))

    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'))
    })
}

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 LaoWang Sub-converter server running on port ${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api`)
    console.log(`🔗 Health: http://localhost:${PORT}/health`)
})

export default app
