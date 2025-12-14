/**
 * 输入验证工具函数
 * @module validators
 */
import { VALIDATION_RULES } from './constants.js';
/**
 * 验证 UUID 格式
 * @param {string} uuid - 要验证的 UUID
 * @returns {boolean} 是否有效
 */
export function isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string')
        return false;
    return VALIDATION_RULES.UUID_REGEX.test(uuid);
}
/**
 * 验证端口号
 * @param {number|string} port - 要验证的端口号
 * @returns {boolean} 是否有效
 */
export function isValidPort(port) {
    const portNum = parseInt(String(port));
    if (isNaN(portNum))
        return false;
    return portNum >= VALIDATION_RULES.PORT_RANGE.min &&
        portNum <= VALIDATION_RULES.PORT_RANGE.max;
}
/**
 * 验证服务器地址
 * @param {string} server - 服务器地址（域名或IP）
 * @returns {boolean} 是否有效
 */
export function isValidServer(server) {
    if (!server || typeof server !== 'string')
        return false;
    // 检查是否为有效域名或IP
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return domainRegex.test(server) || ipRegex.test(server);
}
/**
 * 验证 Base64 字符串
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否有效
 */
export function isValidBase64(str) {
    if (!str || typeof str !== 'string')
        return false;
    try {
        const decoded = Buffer.from(str, 'base64').toString('base64');
        return decoded === str;
    }
    catch {
        return false;
    }
}
/**
 * 验证 JSON 字符串
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否有效
 */
export function isValidJSON(str) {
    if (!str || typeof str !== 'string')
        return false;
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * 验证节点配置完整性
 * @param {Object} node - 节点对象
 * @returns {{valid: boolean, errors: string[]}} 验证结果
 */
export function validateNodeConfig(node) {
    const errors = [];
    if (!node) {
        errors.push('节点对象不能为空');
        return { valid: false, errors };
    }
    // 验证必需字段
    if (!node.type)
        errors.push('缺少协议类型');
    if (!node.server)
        errors.push('缺少服务器地址');
    if (!node.port)
        errors.push('缺少端口号');
    // 验证字段值
    if (node.server && !isValidServer(node.server)) {
        errors.push('服务器地址格式无效');
    }
    if (node.port && !isValidPort(node.port)) {
        errors.push('端口号无效');
    }
    // 根据协议类型验证特定字段
    switch (node.type) {
        case 'vmess':
        case 'vless':
            if (node.uuid && !isValidUUID(node.uuid)) {
                errors.push('UUID 格式无效');
            }
            break;
        case 'ss':
            if (!node.method)
                errors.push('缺少加密方法');
            if (!node.password)
                errors.push('缺少密码');
            break;
        case 'trojan':
            if (!node.password)
                errors.push('缺少密码');
            break;
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * 安全的 URL 解码
 * @param {string} str - 要解码的字符串
 * @returns {string} 解码后的字符串
 */
export function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str);
    }
    catch {
        return str;
    }
}
/**
 * 安全的 Base64 解码
 * @param {string} str - 要解码的字符串
 * @returns {string|null} 解码后的字符串，失败返回 null
 */
export function safeBase64Decode(str) {
    try {
        return Buffer.from(str, 'base64').toString('utf-8');
    }
    catch {
        return null;
    }
}
/**
 * 限制字符串长度
 * @param {string} str - 输入字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 截取后的字符串
 */
export function truncateString(str, maxLength) {
    if (!str || typeof str !== 'string')
        return '';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
}
