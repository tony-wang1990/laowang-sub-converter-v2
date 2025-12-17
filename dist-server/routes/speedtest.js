import express from 'express';
import { parseSubscription } from '../utils/parsers.js';
import { batchSpeedTest, getReachableNodes, getSpeedTestStats } from '../utils/speedTest.js';
import { subscriptionCache } from '../utils/cache.js';
const router = express.Router();
// 节点测速接口
router.get('/', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Subscription URL is required'
            });
        }
        const subscriptionUrl = decodeURIComponent(url);
        let nodes = [];
        // 检测是否为单个节点链接（非HTTP/HTTPS协议）
        const isNodeLink = /^(vmess|vless|ss|ssr|trojan|hysteria|hysteria2|tuic):\/\//i.test(subscriptionUrl);
        if (isNodeLink) {
            // 直接解析单个节点
            console.log('Detected single node link, parsing directly...');
            const parsedNodes = parseSubscription(subscriptionUrl);
            if (parsedNodes.length > 0) {
                nodes = parsedNodes;
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid node link format'
                });
            }
        }
        else {
            // 获取订阅内容
            // @ts-ignore
            let rawContent = subscriptionCache.get(subscriptionCache.generateKey(subscriptionUrl));
            if (!rawContent) {
                const response = await fetch(subscriptionUrl, {
                    headers: { 'User-Agent': 'LaoWang-Sub-Converter/2.0' }
                });
                if (!response.ok) {
                    return res.status(502).json({
                        success: false,
                        error: 'Failed to fetch subscription'
                    });
                }
                rawContent = await response.text();
                // @ts-ignore
                subscriptionCache.set(subscriptionCache.generateKey(subscriptionUrl), rawContent);
            }
            // 解析节点
            nodes = parseSubscription(rawContent);
        }
        if (nodes.length === 0) {
            return res.json({
                success: true,
                message: 'No nodes found',
                results: [],
                stats: {
                    total: 0,
                    reachable: 0,
                    unreachable: 0,
                    reachableRate: '0%'
                }
            });
        }
        // 执行测速（最多测试前100个节点）
        const nodesToTest = nodes.slice(0, 100);
        console.log(`Starting speed test for ${nodesToTest.length} nodes...`);
        const results = await batchSpeedTest(nodesToTest, 20); // 并发20个
        const reachableNodes = getReachableNodes(results);
        const stats = getSpeedTestStats(results);
        res.json({
            success: true,
            results: reachableNodes.slice(0, 20).map(r => ({
                name: r.node.name,
                server: r.node.server,
                port: r.node.port,
                type: r.node.type,
                latency: r.latency,
                reachable: r.reachable
            })),
            stats
        });
    }
    catch (error) {
        console.error('Speed test error:', error);
        res.status(500).json({
            success: false,
            error: 'Speed test failed',
            message: error.message || 'Unknown error'
        });
    }
});
export default router;
