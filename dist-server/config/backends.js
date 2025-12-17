export const REMOTE_BACKENDS = [
    {
        name: 'API-1 (肥羊)',
        url: 'https://sub.v1.mk/sub',
        timeout: 15000,
        priority: 1,
        enabled: true
    },
    {
        name: 'API-2 (品云)',
        url: 'https://api.pinyun.me/sub',
        timeout: 15000,
        priority: 2,
        enabled: true
    },
    {
        name: 'API-3 (nameless13)',
        url: 'https://api.nameless13.com/sub',
        timeout: 15000,
        priority: 3,
        enabled: true
    },
    {
        name: 'API-4 (subconverter-web)',
        url: 'https://sub.id9.cc/sub',
        timeout: 15000,
        priority: 4,
        enabled: true
    }
];
// 转换模式
export var ConversionMode;
(function (ConversionMode) {
    ConversionMode["LOCAL"] = "local";
    ConversionMode["REMOTE"] = "remote";
    ConversionMode["HYBRID"] = "hybrid";
    ConversionMode["FALLBACK"] = "fallback"; // 本地优先，失败则远程
})(ConversionMode || (ConversionMode = {}));
// 默认配置
export const DEFAULT_CONFIG = {
    mode: ConversionMode.FALLBACK,
    enableCache: true,
    cacheTimeout: 300, // 5分钟
    maxRetries: 3,
    retryDelay: 1000
};
export default {
    REMOTE_BACKENDS,
    ConversionMode,
    DEFAULT_CONFIG
};
