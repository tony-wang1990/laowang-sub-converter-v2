import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Initialize database
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);
/**
 * 清理7天前的短链接
 */
export function cleanupOldShortLinks() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        db.run(`
            DELETE FROM short_links 
            WHERE created_at < ?
        `, [sevenDaysAgo.toISOString()], function (err) {
            if (err) {
                console.error('Failed to cleanup old short links:', err);
            }
            else if (this.changes > 0) {
                console.log(`🗑️  Cleaned up ${this.changes} short links older than 7 days`);
            }
        });
    }
    catch (error) {
        console.error('Failed to cleanup old short links:', error);
    }
}
/**
 * 启动定时清理任务
 * 每天凌晨3点执行一次
 */
export function startCleanupScheduler() {
    // 立即执行一次
    cleanupOldShortLinks();
    // 每24小时执行一次（凌晨3点）
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);
    // 如果今天3点已过，设置为明天3点
    if (next3AM <= now) {
        next3AM.setDate(next3AM.getDate() + 1);
    }
    const msUntil3AM = next3AM.getTime() - now.getTime();
    setTimeout(() => {
        cleanupOldShortLinks();
        // 之后每24小时执行一次
        setInterval(cleanupOldShortLinks, 24 * 60 * 60 * 1000);
    }, msUntil3AM);
    console.log(`⏰ Scheduled short link cleanup at 3:00 AM daily (next run: ${next3AM.toLocaleString()})`);
}
