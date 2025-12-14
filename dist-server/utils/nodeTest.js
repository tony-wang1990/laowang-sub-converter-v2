// 节点测试工具
export async function testNode(node) {
    const startTime = Date.now();
    try {
        // 简单的连接测试（ping服务器端口）
        const timeout = 5000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const testUrl = `http://${node.server}:${node.port}`;
        try {
            await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const delay = Date.now() - startTime;
            return {
                success: true,
                delay,
                status: 'online',
                message: `延迟: ${delay}ms`
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            // 超时或连接失败
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    delay: timeout,
                    status: 'timeout',
                    message: '连接超时'
                };
            }
            return {
                success: false,
                delay: Date.now() - startTime,
                status: 'offline',
                message: '无法连接'
            };
        }
    }
    catch (error) {
        return {
            success: false,
            delay: -1,
            status: 'error',
            message: error.message || 'Unknown error'
        };
    }
}
// 批量测试节点
export async function testNodes(nodes, concurrency = 5) {
    const results = [];
    // 分批测试，避免过多并发
    for (let i = 0; i < nodes.length; i += concurrency) {
        const batch = nodes.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(node => testNode(node)));
        results.push(...batchResults);
    }
    return results.map((result, index) => ({
        node: nodes[index].name,
        ...result
    }));
}
// 获取订阅统计信息
export function getSubscriptionStats(nodes) {
    const stats = {
        total: nodes.length,
        byProtocol: {},
        byRegion: {},
        protocols: []
    };
    // 按协议统计
    nodes.forEach(node => {
        const protocol = node.type.toUpperCase();
        stats.byProtocol[protocol] = (stats.byProtocol[protocol] || 0) + 1;
    });
    stats.protocols = Object.keys(stats.byProtocol).map(protocol => ({
        name: protocol,
        count: stats.byProtocol[protocol],
        percentage: ((stats.byProtocol[protocol] / stats.total) * 100).toFixed(1)
    }));
    // 按地区统计（从节点名称中提取）
    const regionKeywords = {
        '香港': 'HK', 'HK': 'HK', 'Hong Kong': 'HK',
        '台湾': 'TW', 'TW': 'TW', 'Taiwan': 'TW',
        '日本': 'JP', 'JP': 'JP', 'Japan': 'JP',
        '新加坡': 'SG', 'SG': 'SG', 'Singapore': 'SG',
        '美国': 'US', 'US': 'US', 'USA': 'US',
        '韩国': 'KR', 'KR': 'KR', 'Korea': 'KR'
    };
    nodes.forEach(node => {
        let region = 'OTHER';
        for (const [keyword, code] of Object.entries(regionKeywords)) {
            if (node.name.toUpperCase().includes(keyword.toUpperCase())) {
                region = code;
                break;
            }
        }
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
    });
    return stats;
}
