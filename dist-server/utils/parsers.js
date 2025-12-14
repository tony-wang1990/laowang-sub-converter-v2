import { Buffer } from 'buffer';
// 解析订阅内容
export function parseSubscription(content) {
    const nodes = [];
    // 尝试 Base64 解码
    try {
        const decoded = Buffer.from(content, 'base64').toString('utf-8');
        if (decoded.includes('://')) {
            content = decoded;
        }
    }
    catch (e) {
        // 不是 Base64 格式，使用原始内容
    }
    // 解析节点链接
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('ss://')) {
            const node = parseSS(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('ssr://')) {
            const node = parseSSR(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('vmess://')) {
            const node = parseVmess(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('vless://')) {
            const node = parseVless(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('trojan://')) {
            const node = parseTrojan(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('hysteria://') || trimmed.startsWith('hysteria2://') || trimmed.startsWith('hy2://')) {
            const node = parseHysteria(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('tuic://')) {
            const node = parseTUIC(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('wireguard://')) {
            const node = parseWireGuard(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('brook://')) {
            const node = parseBrook(trimmed);
            if (node)
                nodes.push(node);
        }
        else if (trimmed.startsWith('snell://')) {
            const node = parseSnell(trimmed);
            if (node)
                nodes.push(node);
        }
    }
    return nodes;
}
// SS 解析 - 增强版，支持多种格式
function parseSS(uri) {
    try {
        const hashIndex = uri.indexOf('#');
        const name = hashIndex > -1 ? decodeURIComponent(uri.slice(hashIndex + 1)) : 'SS Node';
        const uriWithoutHash = hashIndex > -1 ? uri.slice(0, hashIndex) : uri;
        // 尝试 SIP002 格式: ss://base64(method:password)@server:port
        try {
            const url = new URL(uriWithoutHash);
            if (url.username && url.hostname && url.port) {
                // 解码 userinfo 部分
                const decoded = Buffer.from(decodeURIComponent(url.username), 'base64').toString();
                const colonIndex = decoded.indexOf(':');
                if (colonIndex > -1) {
                    const method = decoded.slice(0, colonIndex);
                    const password = decoded.slice(colonIndex + 1);
                    const node = {
                        type: 'ss',
                        name,
                        server: url.hostname,
                        port: parseInt(url.port),
                        method,
                        password
                    };
                    // 识别 SS2022
                    if (method.startsWith('2022-')) {
                        node.type = 'ss2022';
                        // SS2022 只需要 key，部分客户端可能需要 extra info
                    }
                    // 解析插件参数
                    const plugin = url.searchParams.get('plugin');
                    if (plugin) {
                        node.plugin = plugin;
                        const pluginOpts = url.searchParams.get('plugin-opts');
                        if (pluginOpts) {
                            node.pluginOpts = pluginOpts;
                        }
                    }
                    return node;
                }
            }
        }
        catch (e) {
            // SIP002 解析失败，尝试旧格式
        }
        // 旧格式: ss://base64(method:password@server:port)
        const base64Part = uriWithoutHash.slice(5);
        const decoded = Buffer.from(base64Part, 'base64').toString();
        const atIndex = decoded.lastIndexOf('@');
        if (atIndex > -1) {
            const methodPassword = decoded.slice(0, atIndex);
            const serverPort = decoded.slice(atIndex + 1);
            const colonIndex = methodPassword.indexOf(':');
            const lastColonIndex = serverPort.lastIndexOf(':');
            if (colonIndex > -1 && lastColonIndex > -1) {
                return {
                    type: 'ss',
                    name,
                    server: serverPort.slice(0, lastColonIndex),
                    port: parseInt(serverPort.slice(lastColonIndex + 1)),
                    method: methodPassword.slice(0, colonIndex),
                    password: methodPassword.slice(colonIndex + 1)
                };
            }
        }
        return null;
    }
    catch (e) {
        console.error('SS parse error:', e.message);
        return null;
    }
}
// SSR 解析
function parseSSR(uri) {
    try {
        // ssr://base64编码
        const decoded = Buffer.from(uri.slice(6), 'base64').toString();
        // 格式: server:port:protocol:method:obfs:password_base64/?params
        const parts = decoded.split('/?');
        const mainPart = parts[0];
        const params = new URLSearchParams(parts[1] || '');
        const [server, port, protocol, method, obfs, passwordB64] = mainPart.split(':');
        return {
            type: 'ssr',
            name: params.get('remarks') ? Buffer.from(params.get('remarks') || '', 'base64').toString() : 'SSR Node',
            server,
            port: parseInt(port),
            method,
            password: Buffer.from(passwordB64 || '', 'base64').toString(),
            protocol,
            protocolParam: params.get('protoparam') ? Buffer.from(params.get('protoparam') || '', 'base64').toString() : '',
            obfs,
            obfsParam: params.get('obfsparam') ? Buffer.from(params.get('obfsparam') || '', 'base64').toString() : ''
        };
    }
    catch (e) {
        console.error('SSR parse error:', e.message);
        return null;
    }
}
// VMess 解析 - 增强版
function parseVmess(uri) {
    try {
        const data = JSON.parse(Buffer.from(uri.slice(8), 'base64').toString());
        const node = {
            type: 'vmess',
            name: data.ps || 'VMess Node',
            server: data.add,
            port: parseInt(data.port),
            uuid: data.id,
            alterId: parseInt(data.aid) || 0,
            network: data.net || 'tcp',
            tls: data.tls === 'tls',
            scy: data.scy || 'auto'
        };
        // SNI 支持
        if (data.sni)
            node.sni = data.sni;
        // WebSocket 配置
        if (data.net === 'ws') {
            node.ws = {
                path: data.path || '/',
                headers: data.host ? { Host: data.host } : {}
            };
        }
        // HTTP/2 配置
        if (data.net === 'h2' || data.net === 'http') {
            node.h2 = {
                path: data.path || '/',
                host: data.host ? [data.host] : []
            };
        }
        // gRPC 配置
        if (data.net === 'grpc') {
            node.grpc = {
                serviceName: data.path || ''
            };
        }
        // QUIC 配置
        if (data.net === 'quic') {
            node.quic = {
                security: data.host || 'none',
                key: data.path || '',
                type: data.type || 'none'
            };
        }
        // ALPN 支持
        if (data.alpn) {
            node.alpn = Array.isArray(data.alpn) ? data.alpn : data.alpn.split(',');
        }
        return node;
    }
    catch (e) {
        console.error('VMess parse error:', e.message);
        return null;
    }
}
// VLESS 解析 - 完善版
function parseVless(uri) {
    try {
        const url = new URL(uri);
        const params = url.searchParams;
        const node = {
            type: 'vless',
            name: decodeURIComponent(url.hash.slice(1)) || 'VLESS Node',
            server: url.hostname,
            port: parseInt(url.port),
            uuid: url.username,
            flow: params.get('flow') || '',
            network: params.get('type') || 'tcp'
        };
        // TLS 配置
        const security = params.get('security');
        node.tls = security === 'tls' || security === 'reality';
        // SNI
        if (params.get('sni'))
            node.sni = params.get('sni');
        // ALPN
        if (params.get('alpn')) {
            node.alpn = (params.get('alpn') || '').split(',');
        }
        // Fingerprint
        if (params.get('fp'))
            node.fingerprint = params.get('fp');
        // WebSocket
        if (node.network === 'ws') {
            node.ws = {
                path: decodeURIComponent(params.get('path') || '/'),
                headers: params.get('host') ? { Host: params.get('host') } : {}
            };
        }
        // gRPC
        if (node.network === 'grpc') {
            node.grpc = {
                serviceName: decodeURIComponent(params.get('serviceName') || params.get('path') || '')
            };
        }
        // HTTP/2
        if (node.network === 'h2' || node.network === 'http') {
            node.h2 = {
                path: decodeURIComponent(params.get('path') || '/'),
                host: params.get('host') ? (params.get('host') || '').split(',') : []
            };
        }
        // Reality 配置
        if (security === 'reality') {
            node.reality = {
                publicKey: params.get('pbk') || '',
                shortId: params.get('sid') || params.get('shortId') || '',
                sni: params.get('sni') || '',
                spx: params.get('spx') || ''
            };
        }
        return node;
    }
    catch (e) {
        console.error('VLESS parse error:', e.message);
        return null;
    }
}
// Trojan 解析 - 完善版
function parseTrojan(uri) {
    try {
        const url = new URL(uri);
        const params = url.searchParams;
        const node = {
            type: 'trojan',
            name: decodeURIComponent(url.hash.slice(1)) || 'Trojan Node',
            server: url.hostname,
            port: parseInt(url.port),
            password: decodeURIComponent(url.username),
            sni: params.get('sni') || params.get('peer') || url.hostname
        };
        // ALPN
        if (params.get('alpn')) {
            node.alpn = (params.get('alpn') || '').split(',');
        }
        // Fingerprint
        if (params.get('fp'))
            node.fingerprint = params.get('fp');
        // AllowInsecure
        if (params.get('allowInsecure')) {
            node.allowInsecure = params.get('allowInsecure') === '1';
        }
        // 传输层配置
        const type = params.get('type');
        if (type === 'ws') {
            node.network = 'ws';
            node.ws = {
                path: decodeURIComponent(params.get('path') || '/'),
                headers: params.get('host') ? { Host: params.get('host') } : {}
            };
        }
        else if (type === 'grpc') {
            node.network = 'grpc';
            node.grpc = {
                serviceName: decodeURIComponent(params.get('serviceName') || '')
            };
        }
        else {
            node.network = 'tcp';
        }
        return node;
    }
    catch (e) {
        console.error('Trojan parse error:', e.message);
        return null;
    }
}
// Hysteria/Hysteria2 解析
function parseHysteria(uri) {
    try {
        // 检测协议版本
        const isV2 = uri.startsWith('hysteria2://') || uri.startsWith('hy2://');
        const url = new URL(uri);
        const params = url.searchParams;
        return {
            type: isV2 ? 'hysteria2' : 'hysteria',
            name: decodeURIComponent(url.hash.slice(1)) || 'Hysteria Node',
            server: url.hostname,
            port: parseInt(url.port),
            password: isV2 ? decodeURIComponent(url.username) : undefined,
            auth: !isV2 ? params.get('auth') : undefined,
            obfs: params.get('obfs'),
            obfsParam: params.get('obfsParam'),
            protocol: params.get('protocol') || 'udp',
            up: params.get('up') || params.get('upmbps'),
            down: params.get('down') || params.get('downmbps'),
            sni: params.get('sni') || params.get('peer') || url.hostname,
            alpn: params.get('alpn') ? (params.get('alpn') || '').split(',') : undefined,
            insecure: (params.get('insecure') || '0') === '1'
        };
    }
    catch (e) {
        console.error('Hysteria parse error:', e.message);
        return null;
    }
}
// TUIC 解析
function parseTUIC(uri) {
    try {
        const url = new URL(uri);
        const params = url.searchParams;
        return {
            type: 'tuic',
            name: decodeURIComponent(url.hash.slice(1)) || 'TUIC Node',
            server: url.hostname,
            port: parseInt(url.port),
            uuid: url.username,
            password: decodeURIComponent(url.password || ''),
            congestionControl: params.get('congestion_control') || params.get('cc') || 'bbr',
            udpRelayMode: params.get('udp_relay_mode') || 'native',
            alpn: params.get('alpn') ? (params.get('alpn') || '').split(',') : ['h3'],
            sni: params.get('sni') || url.hostname,
            allowInsecure: params.get('allow_insecure') === '1' || params.get('insecure') === '1'
        };
    }
    catch (e) {
        console.error('TUIC parse error:', e.message);
        return null;
    }
}
// WireGuard 解析
function parseWireGuard(uri) {
    try {
        const url = new URL(uri);
        const params = url.searchParams;
        return {
            type: 'wireguard',
            name: decodeURIComponent(url.hash.slice(1)) || 'WireGuard Node',
            privateKey: url.username, // 自定义格式：wireguard://privateKey@server:port
            server: url.hostname,
            port: parseInt(url.port),
            publicKey: params.get('publicKey') || params.get('pubkey'),
            ip: params.get('ip') || params.get('address'),
            ipv6: params.get('ipv6'),
            mtu: parseInt(params.get('mtu') || '1420') || 1420,
            dns: params.get('dns') || undefined,
            reserved: params.get('reserved') ? (params.get('reserved') || '').split(',').map(Number) : undefined
        };
    }
    catch (e) {
        console.error('WireGuard parse error:', e.message);
        return null;
    }
}
// Brook 解析
function parseBrook(uri) {
    try {
        // Handle standard URL if possible, but Brook often uses brook://server:port:password
        if (uri.includes('@')) {
            const url = new URL(uri);
            const params = url.searchParams;
            return {
                type: 'brook',
                name: decodeURIComponent(url.hash.slice(1)) || 'Brook Node',
                server: url.hostname,
                port: parseInt(url.port),
                password: decodeURIComponent(url.username),
                protocol: params.get('protocol') || 'brook'
            };
        }
        // Handle non-standard format: brook://server:port:password
        const withoutScheme = uri.replace('brook://', '');
        const hashIndex = withoutScheme.indexOf('#');
        const mainPart = hashIndex > -1 ? withoutScheme.slice(0, hashIndex) : withoutScheme;
        const name = hashIndex > -1 ? decodeURIComponent(withoutScheme.slice(hashIndex + 1)) : 'Brook Node';
        const parts = mainPart.split(':');
        if (parts.length >= 3) {
            return {
                type: 'brook',
                name: name,
                server: parts[0],
                port: parseInt(parts[1]),
                password: decodeURIComponent(parts.slice(2).join(':')),
                protocol: 'brook'
            };
        }
        return null;
    }
    catch (e) {
        console.error('Brook parse error:', e.message);
        return null;
    }
}
// Snell 解析 V4
function parseSnell(uri) {
    try {
        const url = new URL(uri);
        const params = url.searchParams;
        return {
            type: 'snell',
            name: decodeURIComponent(url.hash.slice(1)) || 'Snell Node',
            server: url.hostname,
            port: parseInt(url.port),
            psk: decodeURIComponent(url.username), // psk
            version: parseInt(params.get('version') || '4') || 4,
            obfs: params.get('obfs') || 'http',
            obfsOpts: {
                host: params.get('host'),
                uri: params.get('path')
            }
        };
    }
    catch (e) {
        console.error('Snell parse error:', e.message);
        return null;
    }
}
// 添加 Emoji
export function addEmoji(name) {
    const emojiMap = {
        '香港': '🇭🇰', 'HK': '🇭🇰', 'Hong Kong': '🇭🇰', 'HongKong': '🇭🇰',
        '台湾': '🇹🇼', 'TW': '🇹🇼', 'Taiwan': '🇹🇼',
        '日本': '🇯🇵', 'JP': '🇯🇵', 'Japan': '🇯🇵',
        '新加坡': '🇸🇬', 'SG': '🇸🇬', 'Singapore': '🇸🇬',
        '美国': '🇺🇸', 'US': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸',
        '韩国': '🇰🇷', 'KR': '🇰🇷', 'Korea': '🇰🇷', 'South Korea': '🇰🇷',
        '英国': '🇬🇧', 'UK': '🇬🇧', 'Britain': '🇬🇧', 'United Kingdom': '🇬🇧',
        '德国': '🇩🇪', 'DE': '🇩🇪', 'Germany': '🇩🇪',
        '法国': '🇫🇷', 'FR': '🇫🇷', 'France': '🇫🇷',
        '俄罗斯': '🇷🇺', 'RU': '🇷🇺', 'Russia': '🇷🇺',
        '加拿大': '🇨🇦', 'CA': '🇨🇦', 'Canada': '🇨🇦',
        '澳大利亚': '🇦🇺', 'AU': '🇦🇺', 'Australia': '🇦🇺',
        '印度': '🇮🇳', 'IN': '🇮🇳', 'India': '🇮🇳',
        '荷兰': '🇳🇱', 'NL': '🇳🇱', 'Netherlands': '🇳🇱',
        '阿根廷': '🇦🇷', 'AR': '🇦🇷', 'Argentina': '🇦🇷'
    };
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (name.toUpperCase().includes(key.toUpperCase())) {
            return `${emoji} ${name}`;
        }
    }
    return `🌐 ${name}`;
}
