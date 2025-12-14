import express from 'express';
import QRCode from 'qrcode';
const router = express.Router();
// GET /api/qrcode - Generate QR code
router.get('/', async (req, res) => {
    try {
        const { text, size = '300', errorCorrectionLevel = 'M' } = req.query;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text parameter is required' });
        }
        const qrSize = parseInt(size, 10);
        if (isNaN(qrSize) || qrSize < 100 || qrSize > 1000) {
            return res.status(400).json({ error: 'Size must be between 100 and 1000' });
        }
        const validLevels = ['L', 'M', 'Q', 'H'];
        const ecLevel = errorCorrectionLevel.toUpperCase();
        if (!validLevels.includes(ecLevel)) {
            return res.status(400).json({ error: 'Invalid error correction level. Use L, M, Q, or H' });
        }
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(text, {
            width: qrSize,
            margin: 2,
            errorCorrectionLevel: ecLevel
        });
        res.json({
            success: true,
            dataUrl: qrCodeDataUrl,
            text,
            size: qrSize
        });
    }
    catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});
// GET /api/qrcode/image - Generate QR code as PNG image
router.get('/image', async (req, res) => {
    try {
        const { text, size = '300', errorCorrectionLevel = 'M' } = req.query;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text parameter is required' });
        }
        const qrSize = parseInt(size, 10);
        if (isNaN(qrSize) || qrSize < 100 || qrSize > 1000) {
            return res.status(400).json({ error: 'Size must be between 100 and 1000' });
        }
        const validLevels = ['L', 'M', 'Q', 'H'];
        const ecLevel = errorCorrectionLevel.toUpperCase();
        if (!validLevels.includes(ecLevel)) {
            return res.status(400).json({ error: 'Invalid error correction level' });
        }
        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(text, {
            width: qrSize,
            margin: 2,
            errorCorrectionLevel: ecLevel,
            type: 'png'
        });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
        res.send(qrBuffer);
    }
    catch (error) {
        console.error('QR code image generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code image' });
    }
});
export default router;
