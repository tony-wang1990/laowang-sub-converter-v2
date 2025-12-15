import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
// Import routes
import convertRouter from './routes/convert.js';
import shortlinkRouter from './routes/shortlink.js';
import subscriptionRouter from './routes/subscriptions.js';
import qrcodeRouter from './routes/qrcode.js';
import speedtestRouter from './routes/speedtest.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
console.log('🔧 Server Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   PORT:', PORT);
console.log('   __dirname:', __dirname);
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// API routes
app.use('/api/convert', convertRouter);
app.use('/api/shortlink', shortlinkRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/qrcode', qrcodeRouter);
app.use('/api/speedtest', speedtestRouter);
app.use('/s', shortlinkRouter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve static files - check if dist directory exists
const distPath = path.join(__dirname, '../dist');
const distExists = existsSync(distPath);
const indexPath = path.join(distPath, 'index.html');
const indexExists = existsSync(indexPath);
console.log('📁 Static Files Check:');
console.log('   Dist Path:', distPath);
console.log('   Dist Exists:', distExists);
console.log('   Index.html Path:', indexPath);
console.log('   Index.html Exists:', indexExists);
if (distExists && indexExists) {
    console.log('✅ Serving static files from dist directory');
    // Serve static assets (CSS, JS, images, etc.)
    app.use(express.static(distPath));
    // Explicit root handler
    app.get('/', (req, res) => {
        console.log('🏠 Serving root index.html');
        res.sendFile(indexPath);
    });
    // Catch-all route for SPA - must be last
    app.get('*', (req, res) => {
        console.log(`🔀 Catch-all route hit: ${req.url}`);
        res.sendFile(indexPath);
    });
}
else {
    console.log('⚠️  Static files not found - running in API-only mode');
    app.get('/', (req, res) => {
        res.json({
            message: 'LaoWang Sub-converter API',
            status: 'running',
            mode: 'api-only',
            reason: !distExists ? 'dist directory not found' : 'index.html not found',
            distPath,
            distExists,
            indexExists
        });
    });
}
// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 LaoWang Sub-converter server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
});
export default app;
