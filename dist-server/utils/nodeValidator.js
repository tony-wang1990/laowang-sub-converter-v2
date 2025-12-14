/**
 * 节点验证和过滤工具
 */
/**
 * 验证节点是否有效
 */
export function isValidNode(node) {
    // 基础字段验证
    if (!node.type || !node.server || !node.port) {
        return false;
    }
    // 验证服务器地址
    if (!isValidServer(node.server)) {
        return false;
    }
    // 验证端口
    const port = typeof node.port === 'string' ? parseInt(node.port) : node.port;
    if (isNaN(port) || port < 1 || port > 65535) {
        return false;
    }
    // 根据类型进行特定验证
    switch (node.type.toLowerCase()) {
        case 'ss':
        case 'shadowsocks':
            return validateShadowsocks(node);
        case 'ssr':
            return validateShadowsocksR(node);
        case 'vmess':
            return validateVMess(node);
        case 'trojan':
            return validateTrojan(node);
        default:
            return true; // 未知类型暂时通过
    }
}
/**
 * 验证服务器地址是否合法
 */
function isValidServer(server) {
    if (!server || typeof server !== 'string')
        return false;
    // 排除明显无效的地址
    const invalidPatterns = [
        /^localhost$/i,
        /^127\.0\.0\.1$/,
        /^0\.0\.0\.0$/,
        /^::1$/,
        /^example\./i,
        /^test\./i,
        /\.local$/i
    ];
    for (const pattern of invalidPatterns) {
        if (pattern.test(server)) {
            return false;
        }
    }
    return true;
}
/**
 * 验证 Shadowsocks 节点
 */
function validateShadowsocks(node) {
    return !!(node.password && node.method);
}
/**
 * 验证 ShadowsocksR 节点
 */
function validateShadowsocksR(node) {
    return !!(node.password &&
        node.method &&
        node.protocol &&
        node.obfs);
}
/**
 * 验证 VMess 节点
 */
function validateVMess(node) {
    return !!(node.uuid || node.id);
}
/**
 * 验证 Trojan 节点
 */
function validateTrojan(node) {
    return !!node.password;
}
/**
 * 过滤危险节点（Filter Dangerous Nodes）
 */
export function filterDangerousNodes(nodes) {
    return nodes.filter(node => {
        try {
            return isValidNode(node);
        }
        catch (error) {
            console.warn('Node validation error:', error);
            return false;
        }
    });
}
/**
 * 获取过滤统计
 */
export function getFilterStats(originalNodes, filteredNodes) {
    const removed = originalNodes.length - filteredNodes.length;
    return {
        original: originalNodes.length,
        filtered: filteredNodes.length,
        removed,
        removedPercentage: originalNodes.length > 0
            ? ((removed / originalNodes.length) * 100).toFixed(1)
            : '0'
    };
}
export default {
    isValidNode,
    filterDangerousNodes,
    getFilterStats
};
