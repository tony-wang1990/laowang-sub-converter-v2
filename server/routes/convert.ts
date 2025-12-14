
import express, { Request, Response } from 'express'
import { parseSubscription, addEmoji } from '../utils/parsers.js'
import { convertToTarget } from '../utils/converters.js'
import { subscriptionCache } from '../utils/cache.js'
import { getSubscriptionStats } from '../utils/nodeTest.js'
import { workerPool } from '../utils/workerManager.js'

const router = express.Router()

const SUPPORTED_CLIENTS: Record<string, string> = {
    // Clash 系列
    clash: 'clash',
    clashmeta: 'clashmeta',
    clashverge: 'clash',  // Clash Verge 使用 Clash 格式
    clashforwindows: 'clash',  // CFW 使用 Clash 格式
    stash: 'stash',

    // Surge 系列
    surge: 'surge',
    surfboard: 'surfboard',

    // Shadowsocks 系列
    shadowrocket: 'shadowrocket',

    // V2Ray 系列
    v2rayn: 'v2rayn',
    v2rayng: 'v2rayng',

    // Quantumult 系列
    quantumultx: 'quantumultx',

    // Loon
    loon: 'loon',

    // SingBox 系列
    singbox: 'singbox',
    nekobox: 'singbox',  // NekoBox 使用 SingBox 格式

    // 新增主流客户端
    hiddify: 'singbox',  // Hiddify 支持 SingBox 格式
    karing: 'clash',  // Karing 支持 Clash 格式
    v2box: 'shadowrocket'  // V2Box 兼容 Shadowrocket 格式
}

interface ConvertQuery {
    target: string;
    url: string;
    emoji?: string;
    udp?: string;
    scert?: string;
    sort?: string;
    include?: string;
    exclude?: string;
    rename?: string;
}

// 订阅转换接口
router.get('/', async (req: Request<{}, {}, {}, ConvertQuery>, res: Response) => {
    try {
        const {
            target,
            url,
            emoji = '1',
            udp = '1',
            scert = '0',
            sort = '0',
            include = '',
            exclude = '',
            rename = ''
        } = req.query

        // 参数验证
        if (!target || !SUPPORTED_CLIENTS[target]) {
            return res.status(400).json({
                error: 'Invalid target client',
                supported: Object.keys(SUPPORTED_CLIENTS)
            })
        }

        if (!url) {
            return res.status(400).json({ error: 'Subscription URL is required' })
        }

        // 解码订阅链接
        const subscriptionUrl = decodeURIComponent(url)

        // 生成缓存键
        // @ts-ignore
        const cacheKey = subscriptionCache.generateKey(subscriptionUrl)

        // 尝试从缓存获取
        // @ts-ignore
        let rawContent = subscriptionCache.get(cacheKey)

        if (!rawContent) {
            // 缓存未命中，获取原始订阅内容
            const response = await fetch(subscriptionUrl, {
                headers: {
                    'User-Agent': 'LaoWang-Sub-Converter/1.0'
                }
            })

            if (!response.ok) {
                return res.status(502).json({ error: 'Failed to fetch subscription' })
            }

            rawContent = await response.text()

            // 存入缓存
            // @ts-ignore
            subscriptionCache.set(cacheKey, rawContent)
        }

        // 使用 Worker 线程进行处理
        // @ts-ignore
        const workerResult = await workerPool.run({
            content: rawContent,
            target,
            options: {
                include,
                exclude,
                sort,
                rename,
                emoji,
                udp: udp === '1',
                skipCert: scert === '1'
            }
        })

        if (workerResult.error) {
            throw new Error(workerResult.error)
        }

        const output = workerResult.result

        // 设置响应头
        const contentTypes: Record<string, string> = {
            clash: 'text/yaml',
            clashmeta: 'text/yaml',
            surge: 'text/plain',
            quantumultx: 'text/plain',
            shadowrocket: 'text/plain',
            loon: 'text/plain',
            v2rayn: 'text/plain',
            v2rayng: 'text/plain',
            surfboard: 'text/plain',
            stash: 'text/yaml',
            singbox: 'application/json'
        }

        // 确定文件扩展名
        let extension = 'txt'
        if (target === 'singbox') {
            extension = 'json'
        } else if (['clash', 'clashmeta', 'stash'].includes(target)) {
            extension = 'yaml'
        } else if (['surge', 'loon', 'surfboard'].includes(target)) {
            extension = 'conf'
        }

        res.setHeader('Content-Type', contentTypes[target] || 'text/plain')
        res.setHeader('Content-Disposition', `attachment; filename="config.${extension}"`)
        res.send(output)

    } catch (error: any) {
        console.error('Conversion error:', error)
        res.status(500).json({ error: 'Conversion failed', message: error.message || 'Unknown error' })
    }
})

// 订阅信息统计接口
router.get('/info', async (req: Request<{}, {}, {}, { url: string }>, res: Response) => {
    try {
        const { url } = req.query

        if (!url) {
            return res.status(400).json({ error: 'Subscription URL is required' })
        }

        const subscriptionUrl = decodeURIComponent(url)

        // 尝试从缓存获取
        // @ts-ignore
        const cacheKey = subscriptionCache.generateKey(subscriptionUrl)
        // @ts-ignore
        let rawContent = subscriptionCache.get(cacheKey)

        if (!rawContent) {
            const response = await fetch(subscriptionUrl, {
                headers: {
                    'User-Agent': 'LaoWang-Sub-Converter/1.0'
                }
            })

            if (!response.ok) {
                return res.status(502).json({ error: 'Failed to fetch subscription' })
            }

            rawContent = await response.text()
            // @ts-ignore
            subscriptionCache.set(cacheKey, rawContent)
        }

        // 解析节点
        const nodes = parseSubscription(rawContent)

        // 获取统计信息
        const stats = getSubscriptionStats(nodes)

        res.json({
            success: true,
            stats,
            fetchedFrom: 'cache'
        })

    } catch (error: any) {
        console.error('Info error:', error)
        res.status(500).json({ error: 'Failed to get subscription info', message: error.message || 'Unknown error' })
    }
})

export default router
