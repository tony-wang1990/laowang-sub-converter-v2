// 简单的内存缓存实现
class SubscriptionCache {
    constructor(ttl = 600000) {
        this.cache = new Map();
        this.ttl = ttl;
    }
    // 生成缓存键
    generateKey(url, options = {}) {
        const optionsStr = JSON.stringify(options);
        return `${url}:${optionsStr}`;
    }
    // 设置缓存
    set(key, value) {
        const expiresAt = Date.now() + this.ttl;
        this.cache.set(key, {
            value,
            expiresAt
        });
    }
    // 获取缓存
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }
        // 检查是否过期
        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return cached.value;
    }
    // 清理过期缓存
    cleanup() {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now > cached.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
    // 获取缓存统计
    getStats() {
        return {
            size: this.cache.size,
            ttl: this.ttl
        };
    }
    // 清空所有缓存
    clear() {
        this.cache.clear();
    }
}
// 创建全局缓存实例
export const subscriptionCache = new SubscriptionCache();
// 定期清理过期缓存（每5分钟）
setInterval(() => {
    subscriptionCache.cleanup();
}, 300000);
