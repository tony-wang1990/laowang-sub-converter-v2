export const REMOTE_BACKENDS = [
    {
        name: 'API-1 (dler.io)',
        url: 'https://api.dler.io/sub',
        timeout: 10000,
        priority: 1,
        enabled: true
    },
    {
        name: 'API-2 (xeton.dev)',
        url: 'https://sub.xeton.dev/sub',
        timeout: 10000,
        priority: 2,
        enabled: true
    },
    {
        name: 'API-3 (wcc.best)',
        url: 'https://api.wcc.best/sub',
        timeout: 10000,
        priority: 3,
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
