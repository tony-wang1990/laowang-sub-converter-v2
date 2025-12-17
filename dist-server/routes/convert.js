import express from 'express';
import { parseSubscription, addEmoji } from '../utils/parsers.js';
import { convertToTarget } from '../utils/converters.js';
import { subscriptionCache } from '../utils/cache.js';
import { getSubscriptionStats } from '../utils/nodeTest.js';
// Worker removed - using synchronous processing
import { smartConvert, parseMultipleUrls } from '../utils/remoteConverter.js';
import { fetchExternalConfig, applyExternalConfig } from '../utils/configManager.js';
const router = express.Router();
const SUPPORTED_CLIENTS = {
    // Clash 系列
    clash: 'clash',
    clashmeta: 'clashmeta',
    clashverge: 'clash',
    clashforwindows: 'clash',
    stash: 'stash',
    // Surge 系列
    surge: 'surge',
    surfboard: 'surfboard',
    // Shadowsocks 系列
    shadowrocket: 'shadowrocket',
    // V2Ray 系列
    v2rayn: 'v2rayn',
    v2rayng: 'v2rayng',
    'v2rayn5': 'v2rayn', // V2RayN 5.x
    // Quantumult 系列
    quantumultx: 'quantumultx',
    // Loon
    loon: 'loon',
    // SingBox 系列
    singbox: 'singbox',
    nekobox: 'singbox',
    nekoray: 'singbox',
    'sing-box': 'singbox',
    // 新增主流客户端
    hiddify: 'singbox',
    'hiddify-next': 'singbox',
    karing: 'clash',
    v2box: 'shadowrocket'
};
// 订阅转换接口（支持混合模式、多订阅、单节点直接转换）
router.get('/', async (req, res) => {
    try {
        const { target, url, emoji = '1', udp = '1', scert = '0', sort = '0', include = '', exclude = '', rename = '', mode = 'fallback', tfo = '0', fdn = '1', // 默认开启过滤
        config } = req.query;
        // 参数验证
        if (!target || !SUPPORTED_CLIENTS[target]) {
            return res.status(400).json({
                error: 'Invalid target client',
                supported: Object.keys(SUPPORTED_CLIENTS)
            });
        }
        if (!url) {
            return res.status(400).json({ error: 'Subscription URL is required' });
        }
        const decodedUrl = decodeURIComponent(url);
        // 检测是否为直接节点链接（vmess://, vless://, ss://, ssr://, trojan://, hysteria://, hysteria2://, tuic://, wg://, brook://, snell://）
        const nodeProtocolPattern = /^(vmess|vless|ss|ssr|trojan|hysteria|hysteria2|tuic|wg|wireguard|brook|snell):\/\//i;
        const isDirectNode = nodeProtocolPattern.test(decodedUrl);
        if (isDirectNode) {
            // 直接节点链接处理 - 使用同步处理，不走 Worker
            console.log(`🔗 Direct node conversion for target: ${target}`);
            try {
                // 解析节点
                let nodes = parseSubscription(decodedUrl);
                if (!nodes || nodes.length === 0) {
                    return res.status(400).json({
                        error: 'Failed to parse node link',
                        hint: 'Please check if the node link format is correct'
                    });
                }
                // 处理选项
                if (include) {
                    const keywords = include.split('|');
                    nodes = nodes.filter(node => keywords.some(kw => node.name.includes(kw)));
                }
                if (exclude) {
                    const keywords = exclude.split('|');
                    nodes = nodes.filter(node => !keywords.some(kw => node.name.includes(kw)));
                }
                if (sort === '1') {
                    nodes.sort((a, b) => a.name.localeCompare(b.name));
                }
                if (emoji === '1') {
                    nodes = nodes.map(node => ({ ...node, name: addEmoji(node.name) }));
                }
                // 转换
                const result = convertToTarget(nodes, SUPPORTED_CLIENTS[target], {
                    udp: udp === '1',
                    skipCert: scert === '1'
                });
                console.log(`✅ Direct node conversion succeeded, ${nodes.length} node(s)`);
                // 设置响应头
                const contentTypes = {
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
                };
                let extension = 'txt';
                if (target === 'singbox') {
                    extension = 'json';
                }
                else if (['clash', 'clashmeta', 'stash'].includes(target)) {
                    extension = 'yaml';
                }
                else if (['surge', 'loon', 'surfboard'].includes(target)) {
                    extension = 'conf';
                }
                res.setHeader('Content-Type', contentTypes[target] || 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="config.${extension}"`);
                res.setHeader('X-Conversion-Source', 'direct');
                return res.send(result);
            }
            catch (nodeError) {
                console.error('Direct node conversion error:', nodeError);
                return res.status(500).json({
                    error: 'Failed to convert node',
                    message: nodeError.message || 'Unknown error'
                });
            }
        }
        // 解析多个订阅URL（支持 | 或换行分隔）
        const urls = parseMultipleUrls(decodedUrl);
        console.log(`Converting ${urls.length} subscription(s) in ${mode} mode`);
        // 如果没有有效的订阅URL，返回错误
        if (urls.length === 0) {
            return res.status(400).json({
                error: 'No valid subscription URLs found',
                hint: 'URL must start with http:// or https://, or be a valid node link (vmess://, vless://, etc.)'
            });
        }
        // 本地转换函数 - 使用同步处理替代 Worker
        const localConvertFn = async (params) => {
            const allContents = [];
            // 获取所有订阅内容
            for (const subscriptionUrl of params.urls) {
                // @ts-ignore
                const cacheKey = subscriptionCache.generateKey(subscriptionUrl);
                // @ts-ignore
                let rawContent = subscriptionCache.get(cacheKey);
                if (!rawContent) {
                    const response = await fetch(subscriptionUrl, {
                        headers: { 'User-Agent': 'LaoWang-Sub-Converter/2.0' }
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch: ${subscriptionUrl}`);
                    }
                    rawContent = await response.text();
                    // @ts-ignore
                    subscriptionCache.set(cacheKey, rawContent);
                }
                allContents.push(rawContent);
            }
            // 合并所有订阅内容
            const mergedContent = allContents.join('\n');
            // 直接同步处理（不使用 Worker）
            let nodes = parseSubscription(mergedContent);
            if (!nodes || nodes.length === 0) {
                throw new Error('No nodes found in subscription');
            }
            // 处理选项
            if (params.include) {
                const keywords = params.include.split('|');
                nodes = nodes.filter((node) => keywords.some((kw) => node.name.includes(kw)));
            }
            if (params.exclude) {
                const keywords = params.exclude.split('|');
                nodes = nodes.filter((node) => !keywords.some((kw) => node.name.includes(kw)));
            }
            if (params.sort) {
                nodes.sort((a, b) => a.name.localeCompare(b.name));
            }
            if (params.emoji) {
                nodes = nodes.map((node) => ({ ...node, name: addEmoji(node.name) }));
            }
            // 转换
            const result = convertToTarget(nodes, params.target, {
                udp: params.udp,
                skipCert: params.skipCert
            });
            return result;
        };
        // 使用智能转换
        let conversionParams = {
            target: SUPPORTED_CLIENTS[target],
            urls,
            emoji: emoji === '1',
            udp: udp === '1',
            skipCert: scert === '1',
            sort: sort === '1',
            tfo: tfo === '1',
            include,
            exclude,
            rename,
            mode
        };
        // 如果提供了外部配置，获取并应用
        if (config) {
            try {
                const externalConfig = await fetchExternalConfig(decodeURIComponent(config));
                if (externalConfig) {
                    conversionParams = applyExternalConfig(conversionParams, externalConfig);
                    console.log('✅ External config applied');
                }
            }
            catch (error) {
                console.warn('Failed to apply external config:', error.message);
                // 配置加载失败不影响转换，继续使用原参数
            }
        }
        const { result: output, source } = await smartConvert(localConvertFn, conversionParams);
        console.log(`✅ Conversion succeeded using ${source} converter`);
        // 设置响应头
        const contentTypes = {
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
        };
        // 确定文件扩展名
        let extension = 'txt';
        if (target === 'singbox') {
            extension = 'json';
        }
        else if (['clash', 'clashmeta', 'stash'].includes(target)) {
            extension = 'yaml';
        }
        else if (['surge', 'loon', 'surfboard'].includes(target)) {
            extension = 'conf';
        }
        res.setHeader('Content-Type', contentTypes[target] || 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="config.${extension}"`);
        res.setHeader('X-Conversion-Source', source); // 标识转换来源
        res.send(output);
    }
    catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed', message: error.message || 'Unknown error' });
    }
});
// 订阅信息统计接口
router.get('/info', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'Subscription URL is required' });
        }
        const subscriptionUrl = decodeURIComponent(url);
        // 尝试从缓存获取
        // @ts-ignore
        const cacheKey = subscriptionCache.generateKey(subscriptionUrl);
        // @ts-ignore
        let rawContent = subscriptionCache.get(cacheKey);
        if (!rawContent) {
            const response = await fetch(subscriptionUrl, {
                headers: {
                    'User-Agent': 'LaoWang-Sub-Converter/1.0'
                }
            });
            if (!response.ok) {
                return res.status(502).json({ error: 'Failed to fetch subscription' });
            }
            rawContent = await response.text();
            // @ts-ignore
            subscriptionCache.set(cacheKey, rawContent);
        }
        // 解析节点
        const nodes = parseSubscription(rawContent);
        // 获取统计信息
        const stats = getSubscriptionStats(nodes);
        res.json({
            success: true,
            stats,
            fetchedFrom: 'cache'
        });
    }
    catch (error) {
        console.error('Info error:', error);
        res.status(500).json({ error: 'Failed to get subscription info', message: error.message || 'Unknown error' });
    }
});
export default router;
