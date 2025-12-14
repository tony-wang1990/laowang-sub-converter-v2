/**
 * 节点速度测试工具
 * 提供TCP连接测试和延迟测量功能
 */
import net from 'net';
/**
 * 测试TCP连接
 */
export async function testTCPConnection(server, port, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const socket = new net.Socket();
        let connected = false;
        // 设置超时
        socket.setTimeout(timeout);
        socket.on('connect', () => {
            connected = true;
            const latency = Date.now() - startTime;
            socket.destroy();
            resolve({ reachable: true, latency });
        });
        socket.on('timeout', () => {
            socket.destroy();
            if (!connected) {
                resolve({ reachable: false, latency: -1 });
            }
        });
        socket.on('error', () => {
            if (!connected) {
                resolve({ reachable: false, latency: -1 });
            }
        });
        try {
            socket.connect(port, server);
        }
        catch (error) {
            resolve({ reachable: false, latency: -1 });
        }
    });
}
/**
 * 测试单个节点
 */
export async function testNode(node) {
    try {
        const { reachable, latency } = await testTCPConnection(node.server, node.port, 5000);
        return {
            node,
            reachable,
            latency,
            error: reachable ? undefined : 'Connection failed'
        };
    }
    catch (error) {
        return {
            node,
            reachable: false,
            latency: -1,
            error: error.message || 'Unknown error'
        };
    }
}
/**
 * 批量测试节点
 */
export async function batchSpeedTest(nodes, concurrency = 10) {
    const results = [];
    // 分批处理
    for (let i = 0; i < nodes.length; i += concurrency) {
        const batch = nodes.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(node => testNode(node)));
        results.push(...batchResults);
        // 进度提示
        console.log(`Speed test progress: ${Math.min(i + concurrency, nodes.length)}/${nodes.length}`);
    }
    return results;
}
/**
 * 获取可达节点（按延迟排序）
 */
export function getReachableNodes(results) {
    return results
        .filter(r => r.reachable)
        .sort((a, b) => a.latency - b.latency);
}
/**
 * 获取统计信息
 */
export function getSpeedTestStats(results) {
    const reachable = results.filter(r => r.reachable);
    const unreachable = results.filter(r => !r.reachable);
    const latencies = reachable.map(r => r.latency).filter(l => l > 0);
    const avgLatency = latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;
    return {
        total: results.length,
        reachable: reachable.length,
        unreachable: unreachable.length,
        reachableRate: ((reachable.length / results.length) * 100).toFixed(1) + '%',
        avgLatency,
        minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
        maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0
    };
}
export default {
    testTCPConnection,
    testNode,
    batchSpeedTest,
    getReachableNodes,
    getSpeedTestStats
};
