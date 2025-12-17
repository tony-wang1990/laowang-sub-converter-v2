import express from 'express';
import crypto from 'crypto';
import { createShortLink, getShortLinkByCode, getAllShortLinks, deleteShortLink, incrementShortLinkClicks } from '../utils/db.js';
const router = express.Router();
// 生成短码
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return result;
}
// POST /api/shortlink - 创建短链接
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // 验证 URL 格式
        try {
            new URL(url);
        }
        catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        // 检查是否已存在相同 URL
        const existingLinks = await getAllShortLinks();
        const existingLink = existingLinks.find(link => link.original_url === url);
        if (existingLink) {
            return res.json({
                success: true,
                code: existingLink.short_code
            });
        }
        // 生成新短码，确保唯一性
        let shortCode = generateShortCode();
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            const existing = await getShortLinkByCode(shortCode);
            if (!existing) {
                break;
            }
            shortCode = generateShortCode();
            attempts++;
        }
        if (attempts >= maxAttempts) {
            return res.status(500).json({ error: 'Failed to generate unique short code' });
        }
        // 创建短链接
        await createShortLink(shortCode, url);
        res.json({
            success: true,
            code: shortCode
        });
    }
    catch (error) {
        console.error('Create short link error:', error);
        res.status(500).json({ error: 'Failed to create short link' });
    }
});
// GET /api/shortlink/list - 获取所有短链接
router.get('/list', async (req, res) => {
    try {
        const links = await getAllShortLinks();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedLinks = links.map(link => ({
            id: link.short_code,
            shortUrl: `${baseUrl}/s/${link.short_code}`,
            originalUrl: link.original_url,
            clicks: link.clicks,
            createdAt: link.created_at
        }));
        res.json({ links: formattedLinks });
    }
    catch (error) {
        console.error('List short links error:', error);
        res.status(500).json({ error: 'Failed to list short links' });
    }
});
// DELETE /api/shortlink/:code - 删除短链接
router.delete('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const link = await getShortLinkByCode(code);
        if (!link) {
            return res.status(404).json({ error: 'Short link not found' });
        }
        await deleteShortLink(link.id);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete short link error:', error);
        res.status(500).json({ error: 'Failed to delete short link' });
    }
});
// GET /s/:code 或 GET /api/shortlink/:code/stats 的处理
// 短链接跳转
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        // 检查是否是统计请求
        if (req.path.endsWith('/stats')) {
            // 统计请求会被下面的路由处理
            return;
        }
        const link = await getShortLinkByCode(code);
        if (!link) {
            return res.status(404).json({ error: 'Short link not found' });
        }
        // 更新点击次数
        await incrementShortLinkClicks(code);
        // 重定向到原始 URL
        res.redirect(302, link.original_url);
    }
    catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({ error: 'Redirect failed' });
    }
});
// GET /api/shortlink/:code/stats - 获取短链接统计
router.get('/:code/stats', async (req, res) => {
    try {
        const { code } = req.params;
        const link = await getShortLinkByCode(code);
        if (!link) {
            return res.status(404).json({ error: 'Short link not found' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.json({
            id: link.short_code,
            shortUrl: `${baseUrl}/s/${link.short_code}`,
            originalUrl: link.original_url,
            clicks: link.clicks,
            createdAt: link.created_at
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
export default router;
