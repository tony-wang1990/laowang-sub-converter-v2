/**
 * 协议常量定义
 * @module constants
 */

// 支持的协议类型
export const PROTOCOL_TYPES = {
    SS: 'ss',
    SSR: 'ssr',
    VMESS: 'vmess',
    VLESS: 'vless',
    TROJAN: 'trojan',
    HYSTERIA: 'hysteria',
    HYSTERIA2: 'hysteria2',
    TUIC: 'tuic',
    SS2022: 'ss2022', // Internal distinction, heavily related to SS
    WIREGUARD: 'wireguard',
    BROOK: 'brook',
    SNELL: 'snell'
}

// 传输协议类型
export const NETWORK_TYPES = {
    TCP: 'tcp',
    WS: 'ws',
    HTTP: 'http',
    H2: 'h2',
    GRPC: 'grpc',
    QUIC: 'quic'
}

// 安全协议类型
export const SECURITY_TYPES = {
    NONE: 'none',
    TLS: 'tls',
    REALITY: 'reality'
}

// 客户端类型映射
export const CLIENT_TYPES = {
    CLASH: 'clash',
    CLASH_META: 'clashmeta',
    CLASH_VERGE: 'clashverge',
    CLASH_FOR_WINDOWS: 'clashforwindows',
    STASH: 'stash',
    SURGE: 'surge',
    SURFBOARD: 'surfboard',
    SHADOWROCKET: 'shadowrocket',
    V2BOX: 'v2box',
    V2RAYN: 'v2rayn',
    V2RAYNG: 'v2rayng',
    QUANTUMULT_X: 'quantumultx',
    LOON: 'loon',
    SINGBOX: 'singbox',
    NEKOBOX: 'nekobox',
    HIDDIFY: 'hiddify',
    KARING: 'karing'
}

// 默认端口
export const DEFAULT_PORTS = {
    HTTP: 80,
    HTTPS: 443,
    SOCKS: 1080
}

// 协议前缀
export const PROTOCOL_PREFIXES = {
    [PROTOCOL_TYPES.SS]: 'ss://',
    [PROTOCOL_TYPES.SSR]: 'ssr://',
    [PROTOCOL_TYPES.VMESS]: 'vmess://',
    [PROTOCOL_TYPES.VLESS]: 'vless://',
    [PROTOCOL_TYPES.TROJAN]: 'trojan://',
    [PROTOCOL_TYPES.HYSTERIA]: 'hysteria://',
    [PROTOCOL_TYPES.HYSTERIA2]: 'hysteria2://',
    [PROTOCOL_TYPES.TUIC]: 'tuic://',
    [PROTOCOL_TYPES.WIREGUARD]: 'wireguard://',
    [PROTOCOL_TYPES.BROOK]: 'brook://',
    [PROTOCOL_TYPES.SNELL]: 'snell://'
}

// 国家/地区 Emoji 映射
export const REGION_EMOJI_MAP = {
    // 亚洲
    '香港': '🇭🇰', 'HK': '🇭🇰', 'Hong Kong': '🇭🇰', 'HongKong': '🇭🇰',
    '台湾': '🇹🇼', 'TW': '🇹🇼', 'Taiwan': '🇹🇼',
    '日本': '🇯🇵', 'JP': '🇯🇵', 'Japan': '🇯🇵',
    '新加坡': '🇸🇬', 'SG': '🇸🇬', 'Singapore': '🇸🇬',
    '韩国': '🇰🇷', 'KR': '🇰🇷', 'Korea': '🇰🇷', 'South Korea': '🇰🇷',
    '印度': '🇮🇳', 'IN': '🇮🇳', 'India': '🇮🇳',

    // 欧洲
    '英国': '🇬🇧', 'UK': '🇬🇧', 'Britain': '🇬🇧', 'United Kingdom': '🇬🇧',
    '德国': '🇩🇪', 'DE': '🇩🇪', 'Germany': '🇩🇪',
    '法国': '🇫🇷', 'FR': '🇫🇷', 'France': '🇫🇷',
    '荷兰': '🇳🇱', 'NL': '🇳🇱', 'Netherlands': '🇳🇱',
    '俄罗斯': '🇷🇺', 'RU': '🇷🇺', 'Russia': '🇷🇺',

    // 美洲
    '美国': '🇺🇸', 'US': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸',
    '加拿大': '🇨🇦', 'CA': '🇨🇦', 'Canada': '🇨🇦',
    '阿根廷': '🇦🇷', 'AR': '🇦🇷', 'Argentina': '🇦🇷',

    // 大洋洲
    '澳大利亚': '🇦🇺', 'AU': '🇦🇺', 'Australia': '🇦🇺'
}

// 默认 Emoji
export const DEFAULT_EMOJI = '🌐'

// 缓存配置
export const CACHE_CONFIG = {
    DEFAULT_TTL: 600000, // 10分钟
    CLEANUP_INTERVAL: 300000 // 5分钟
}

// API 配置
export const API_CONFIG = {
    USER_AGENT: 'LaoWang-Sub-Converter/1.2',
    TIMEOUT: 10000, // 10秒
    MAX_RETRIES: 3
}

// 验证规则
export const VALIDATION_RULES = {
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    PORT_RANGE: { min: 1, max: 65535 },
    MAX_NODE_NAME_LENGTH: 100,
    MAX_PASSWORD_LENGTH: 256
}

// 错误消息
export const ERROR_MESSAGES = {
    INVALID_PROTOCOL: '不支持的协议类型',
    INVALID_URL: 'URL 格式错误',
    INVALID_BASE64: 'Base64 解码失败',
    INVALID_JSON: 'JSON 解析失败',
    INVALID_PORT: '端口号无效',
    INVALID_UUID: 'UUID 格式错误',
    NETWORK_ERROR: '网络请求失败',
    PARSE_ERROR: '节点解析失败',
    CONVERT_ERROR: '格式转换失败'
}
