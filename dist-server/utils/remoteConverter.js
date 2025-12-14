import { REMOTE_BACKENDS, ConversionMode } from '../config/backends.js';
/**
 * 使用远程API进行转换（带故障转移）
 */
export async function remoteConvert(params) {
    const enabledBackends = REMOTE_BACKENDS
        .filter(b => b.enabled)
        .sort((a, b) => a.priority - b.priority);
    let lastError = null;
    for (const backend of enabledBackends) {
        try {
            console.log(`Trying remote backend: ${backend.name}`);
            const url = buildBackendUrl(backend.url, params);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), backend.timeout);
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'LaoWang-Sub-Converter/2.0'
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const result = await response.text();
                console.log(`✅ Remote conversion succeeded with ${backend.name}`);
                return result;
            }
            else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error) {
            lastError = error;
            console.warn(`❌ Backend ${backend.name} failed:`, error.message);
            continue;
        }
    }
    throw new Error(`All remote backends failed. Last error: ${lastError?.message}`);
}
/**
 * 构建远程后端URL
 */
function buildBackendUrl(baseUrl, params) {
    const queryParams = new URLSearchParams({
        target: params.target,
        url: params.urls.join('|'), // 多订阅支持
    });
    // 添加可选参数
    if (params.emoji !== undefined) {
        queryParams.append('emoji', params.emoji ? '1' : '0');
    }
    if (params.udp !== undefined) {
        queryParams.append('udp', params.udp ? '1' : '0');
    }
    if (params.skipCert !== undefined) {
        queryParams.append('scv', params.skipCert ? '1' : '0');
    }
    if (params.sort !== undefined) {
        queryParams.append('sort', params.sort ? '1' : '0');
    }
    if (params.include) {
        queryParams.append('include', params.include);
    }
    if (params.exclude) {
        queryParams.append('exclude', params.exclude);
    }
    if (params.rename) {
        queryParams.append('rename', params.rename);
    }
    return `${baseUrl}?${queryParams.toString()}`;
}
/**
 * 解析多个订阅URL
 */
export function parseMultipleUrls(urlParam) {
    // 支持换行符或 | 分隔
    return urlParam
        .split(/[\n|]/)
        .map(u => u.trim())
        .filter(u => u && u.startsWith('http'));
}
/**
 * 智能转换路由
 */
export async function smartConvert(localConvertFn, params) {
    const mode = params.mode || ConversionMode.FALLBACK;
    try {
        switch (mode) {
            case ConversionMode.LOCAL:
                // 仅本地转换
                const localResult = await localConvertFn(params);
                return { result: localResult, source: 'local' };
            case ConversionMode.REMOTE:
                // 仅远程转换
                const remoteResult = await remoteConvert(params);
                return { result: remoteResult, source: 'remote' };
            case ConversionMode.HYBRID:
            case ConversionMode.FALLBACK:
            default:
                // 本地优先，失败则远程
                try {
                    const hybridLocal = await localConvertFn(params);
                    return { result: hybridLocal, source: 'local' };
                }
                catch (localError) {
                    console.warn('Local conversion failed, falling back to remote:', localError.message);
                    const hybridRemote = await remoteConvert(params);
                    return { result: hybridRemote, source: 'remote' };
                }
        }
    }
    catch (error) {
        throw error;
    }
}
export default {
    remoteConvert,
    parseMultipleUrls,
    smartConvert,
    buildBackendUrl
};
