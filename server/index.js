const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Import routes
const convertRouter = require('./routes/convert')
const shortlinkRouter = require('./routes/shortlink')

// API routes
app.use('/api/convert', convertRouter)
app.use('/api/shortlink', shortlinkRouter)
app.use('/s', shortlinkRouter)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'))
    })
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 LaoWang Sub-converter server running on port ${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api`)
    console.log(`🔗 Health: http://localhost:${PORT}/health`)
})

module.exports = app
