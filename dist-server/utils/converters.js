import yaml from 'js-yaml';
import { Buffer } from 'buffer';
// 转换核心逻辑
export function convertToTarget(nodes, target, options) {
    switch (target) {
        case 'clash':
        case 'clashmeta':
        case 'clashverge': // New
        case 'clashforwindows': // New
        case 'stash':
        case 'karing': // New (Clash compatible)
            return convertToClash(nodes, options);
        case 'surge':
        case 'surfboard':
            return convertToSurge(nodes, options);
        case 'quantumultx':
            return convertToQuantumultX(nodes, options);
        case 'shadowrocket':
        case 'v2box': // New
        case 'v2rayn':
        case 'v2rayng':
            return convertToBase64(nodes);
        case 'loon':
            return convertToLoon(nodes, options);
        case 'singbox':
        case 'nekobox': // New
        case 'hiddify': // New
            return convertToSingBox(nodes, options);
        default:
            return '';
    }
}
// Clash/ClashMeta/Stash 格式 - 增强版
function convertToClash(nodes, options) {
    const proxies = nodes.map(node => {
        const baseProxy = {
            name: node.name,
            server: node.server,
            port: node.port,
            udp: options.udp
        };
        switch (node.type) {
            case 'ss':
            case 'ss2022':
                const ss = { ...baseProxy, type: 'ss', cipher: node.method, password: node.password };
                if (node.plugin) {
                    if (node.plugin.includes(';')) {
                        const parts = node.plugin.split(';');
                        ss.plugin = parts[0];
                        const opts = {};
                        for (let i = 1; i < parts.length; i++) {
                            const [key, val] = parts[i].split('=');
                            if (key && val)
                                opts[key] = val;
                        }
                        ss['plugin-opts'] = { ...opts, ...parsePluginOpts(node.pluginOpts) };
                    }
                    else {
                        ss.plugin = node.plugin;
                        if (node.pluginOpts)
                            ss['plugin-opts'] = parsePluginOpts(node.pluginOpts);
                    }
                }
                return ss;
            case 'ssr':
                return {
                    ...baseProxy,
                    type: 'ssr',
                    cipher: node.method,
                    password: node.password,
                    obfs: node.obfs,
                    protocol: node.protocol,
                    'obfs-param': node.obfsParam,
                    'protocol-param': node.protocolParam
                };
            case 'vmess':
                const vmess = {
                    ...baseProxy,
                    type: 'vmess',
                    uuid: node.uuid,
                    alterId: node.alterId,
                    cipher: node.scy || 'auto'
                };
                if (node.tls) {
                    vmess.tls = true;
                    vmess['skip-cert-verify'] = options.skipCert;
                    if (node.sni)
                        vmess.servername = node.sni;
                    if (node.alpn)
                        vmess.alpn = node.alpn;
                }
                if (node.network && node.network !== 'tcp') {
                    vmess.network = node.network;
                    if (node.ws) {
                        vmess['ws-opts'] = {
                            path: node.ws.path || '/',
                            headers: node.ws.headers || {}
                        };
                    }
                    else if (node.h2) {
                        vmess['h2-opts'] = {
                            path: node.h2.path || '/',
                            host: node.h2.host || []
                        };
                    }
                    else if (node.grpc) {
                        vmess['grpc-opts'] = {
                            'grpc-service-name': node.grpc.serviceName
                        };
                    }
                }
                return vmess;
            case 'vless':
                const vless = {
                    ...baseProxy,
                    type: 'vless',
                    uuid: node.uuid,
                    network: node.network || 'tcp'
                };
                if (node.flow)
                    vless.flow = node.flow;
                if (node.tls) {
                    vless.tls = true;
                    vless['skip-cert-verify'] = options.skipCert;
                    if (node.sni)
                        vless.servername = node.sni;
                    if (node.alpn)
                        vless.alpn = node.alpn;
                    if (node.fingerprint)
                        vless['client-fingerprint'] = node.fingerprint;
                }
                if (node.network === 'ws' && node.ws) {
                    vless['ws-opts'] = {
                        path: node.ws.path || '/',
                        headers: node.ws.headers || {}
                    };
                }
                else if (node.network === 'grpc' && node.grpc) {
                    vless['grpc-opts'] = {
                        'grpc-service-name': node.grpc.serviceName
                    };
                }
                else if ((node.network === 'h2' || node.network === 'http') && node.h2) {
                    vless['h2-opts'] = {
                        path: node.h2.path || '/',
                        host: node.h2.host || []
                    };
                }
                if (node.reality) {
                    vless['reality-opts'] = {
                        'public-key': node.reality.publicKey,
                        'short-id': node.reality.shortId
                    };
                    if (node.reality.sni)
                        vless.servername = node.reality.sni;
                }
                return vless;
            case 'trojan':
                const trojan = {
                    ...baseProxy,
                    type: 'trojan',
                    password: node.password,
                    'skip-cert-verify': options.skipCert
                };
                if (node.sni)
                    trojan.sni = node.sni;
                if (node.alpn)
                    trojan.alpn = node.alpn;
                if (node.fingerprint)
                    trojan['client-fingerprint'] = node.fingerprint;
                if (node.network && node.network !== 'tcp') {
                    trojan.network = node.network;
                    if (node.ws) {
                        trojan['ws-opts'] = {
                            path: node.ws.path || '/',
                            headers: node.ws.headers || {}
                        };
                    }
                    else if (node.grpc) {
                        trojan['grpc-opts'] = {
                            'grpc-service-name': node.grpc.serviceName
                        };
                    }
                }
                return trojan;
            case 'hysteria':
            case 'hysteria2':
                return {
                    ...baseProxy,
                    type: node.type,
                    password: node.password || node.auth,
                    obfs: node.obfs,
                    'obfs-password': node.obfsParam,
                    up: node.up,
                    down: node.down,
                    sni: node.sni,
                    alpn: node.alpn,
                    'skip-cert-verify': node.insecure || options.skipCert
                };
            case 'tuic':
                return {
                    ...baseProxy,
                    type: 'tuic',
                    uuid: node.uuid,
                    password: node.password,
                    ip: node.ip, // if available
                    'congestion-controller': node.congestionControl,
                    'udp-relay-mode': node.udpRelayMode,
                    sni: node.sni,
                    alpn: node.alpn,
                    'skip-cert-verify': node.allowInsecure || options.skipCert
                };
            case 'wireguard':
                return {
                    ...baseProxy,
                    type: 'wireguard',
                    ip: node.ip,
                    ipv6: node.ipv6,
                    'private-key': node.privateKey,
                    'public-key': node.publicKey,
                    'pre-shared-key': node.preSharedKey,
                    dns: node.dns ? node.dns.split(',') : undefined,
                    mtu: node.mtu,
                    'remote-dns-resolve': true
                };
            case 'snell':
                return {
                    ...baseProxy,
                    type: 'snell',
                    psk: node.psk,
                    version: node.version,
                    'obfs-opts': node.obfs === 'http' ? { mode: 'http', host: node.obfsOpts?.host, uri: node.obfsOpts?.uri } : undefined
                };
            default:
                return null;
        }
    }).filter(Boolean);
    // 构建完整的 Clash 配置
    const config = {
        proxies,
        'proxy-groups': [
            {
                name: '🚀 节点选择',
                type: 'select',
                proxies: ['♻️ 自动选择', 'DIRECT', ...proxies.map((p) => p.name)]
            },
            {
                name: '♻️ 自动选择',
                type: 'url-test',
                proxies: proxies.map((p) => p.name),
                url: 'http://www.gstatic.com/generate_204',
                interval: 300
            }
        ],
        rules: [
            'MATCH,🚀 节点选择'
        ]
    };
    // 使用 js-yaml 生成标准 YAML
    const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
    });
    return `# LaoWang Sub-converter 生成
# 节点数量: ${nodes.length}
# 生成时间: ${new Date().toISOString()}

${yamlContent}`;
}
// Surge 格式 - 改进版
function convertToSurge(nodes, options) {
    const proxies = nodes.map(node => {
        switch (node.type) {
            case 'ss':
                let ss = `${node.name} = ss, ${node.server}, ${node.port}, encrypt-method=${node.method}, password=${node.password}`;
                if (node.plugin)
                    ss += `, plugin=${node.plugin}`;
                if (options.udp)
                    ss += ', udp-relay=true';
                return ss;
            case 'vmess':
                let vmess = `${node.name} = vmess, ${node.server}, ${node.port}, username=${node.uuid}`;
                if (node.tls) {
                    vmess += ', tls=true';
                    if (node.sni)
                        vmess += `, sni=${node.sni}`;
                }
                if (node.network === 'ws' && node.ws) {
                    vmess += ', ws=true';
                    if (node.ws.path)
                        vmess += `, ws-path=${node.ws.path}`;
                    if (node.ws.headers?.Host)
                        vmess += `, ws-headers=Host:${node.ws.headers.Host}`;
                }
                if (options.skipCert)
                    vmess += ', skip-cert-verify=true';
                return vmess;
            case 'vless':
                let vless = `${node.name} = vless, ${node.server}, ${node.port}, username=${node.uuid}`;
                if (node.tls)
                    vless += ', tls=true';
                if (options.skipCert)
                    vless += ', skip-cert-verify=true';
                if (node.network === 'ws' && node.ws) {
                    vless += ', ws=true';
                    if (node.ws.path)
                        vless += `, ws-path=${node.ws.path}`;
                }
                return vless;
            case 'trojan':
                let trojan = `${node.name} = trojan, ${node.server}, ${node.port}, password=${node.password}`;
                if (node.sni)
                    trojan += `, sni=${node.sni}`;
                if (options.skipCert)
                    trojan += ', skip-cert-verify=true';
                return trojan;
            case 'hysteria2':
                return `${node.name} = hysteria2, ${node.server}, ${node.port}, password=${node.password}, sni=${node.sni || node.server}`;
            case 'snell':
                return `${node.name} = snell, ${node.server}, ${node.port}, psk=${node.psk}, version=${node.version}, obfs=${node.obfs}`;
            case 'wireguard':
                // Surge WireGuard specific format
                // Section [Proxy] needs to be handled carefully, typically section-based
                // For simplicity returning standard line if possible, but WireGuard in Surge is usually a section
                return null; // Complex to inline, skipping for now unless dedicated section logic added
            default:
                return null;
        }
    }).filter(Boolean);
    return `# LaoWang Sub-converter - Surge 配置
# 节点数量: ${nodes.length}
# 生成时间: ${new Date().toISOString()}

[Proxy]
${proxies.join('\n')}

[Proxy Group]
🚀 节点选择 = select, ${proxies.map(p => p.split(' = ')[0]).join(', ')}
`;
}
// Quantumult X 格式 - 优化版
function convertToQuantumultX(nodes, options) {
    const proxies = nodes.map(node => {
        switch (node.type) {
            case 'ss':
                return `shadowsocks=${node.server}:${node.port}, method=${node.method}, password=${node.password}, tag=${node.name}`;
            case 'vmess':
                let vmess = `vmess=${node.server}:${node.port}, method=chacha20-poly1305, password=${node.uuid}, tag=${node.name}`;
                if (node.tls)
                    vmess += ', obfs=over-tls';
                if (node.network === 'ws' && node.ws) {
                    vmess += ', obfs=ws';
                    if (node.ws.path)
                        vmess += `, obfs-uri=${node.ws.path}`;
                    if (node.ws.headers?.Host)
                        vmess += `, obfs-host=${node.ws.headers.Host}`;
                }
                if (options.skipCert)
                    vmess += ', tls-verification=false';
                return vmess;
            case 'vless':
                let vless = `vless=${node.server}:${node.port}, method=none, password=${node.uuid}, tag=${node.name}`;
                if (node.tls)
                    vless += ', obfs=over-tls';
                if (options.skipCert)
                    vless += ', tls-verification=false';
                return vless;
            case 'trojan':
                let trojan = `trojan=${node.server}:${node.port}, password=${node.password}, tag=${node.name}`;
                if (node.sni)
                    trojan += `, tls-host=${node.sni}`;
                if (options.skipCert)
                    trojan += ', tls-verification=false';
                return trojan;
            default:
                return '';
        }
    }).filter(Boolean);
    return `# LaoWang Sub-converter - Quantumult X 配置
# 节点数量: ${nodes.length}
# 生成时间: ${new Date().toISOString()}

[server_local]
${proxies.join('\n')}
`;
}
// Loon 格式 - 改进版
function convertToLoon(nodes, options) {
    const proxies = nodes.map(node => {
        switch (node.type) {
            case 'ss':
                return `${node.name} = Shadowsocks,${node.server},${node.port},${node.method},"${node.password}"`;
            case 'vmess':
                let vmess = `${node.name} = vmess,${node.server},${node.port},auto,"${node.uuid}"`;
                if (node.network === 'ws' && node.ws) {
                    vmess += ',transport=ws';
                    if (node.ws.path)
                        vmess += `,path=${node.ws.path}`;
                    if (node.ws.headers?.Host)
                        vmess += `,host=${node.ws.headers.Host}`;
                }
                if (node.tls)
                    vmess += ',over-tls=true';
                if (options.skipCert)
                    vmess += ',skip-cert-verify=true';
                return vmess;
            case 'vless':
                let vless = `${node.name} = vless,${node.server},${node.port},"${node.uuid}"`;
                if (node.network === 'ws' && node.ws) {
                    vless += ',transport=ws';
                    if (node.ws.path)
                        vless += `,path=${node.ws.path}`;
                }
                if (node.tls)
                    vless += ',over-tls=true';
                return vless;
            case 'trojan':
                let trojan = `${node.name} = trojan,${node.server},${node.port},"${node.password}"`;
                if (node.sni)
                    trojan += `,sni=${node.sni}`;
                if (options.skipCert)
                    trojan += ',skip-cert-verify=true';
                return trojan;
            default:
                return '';
        }
    }).filter(Boolean);
    return `# LaoWang Sub-converter - Loon 配置
# 节点数量: ${nodes.length}

[Proxy]
${proxies.join('\n')}
`;
}
// Base64 格式 (Shadowrocket, V2RayN) - 增强版
function convertToBase64(nodes) {
    const links = nodes.map(node => {
        switch (node.type) {
            case 'ss':
                const ssAuth = Buffer.from(`${node.method}:${node.password}`).toString('base64');
                let ssUrl = `ss://${ssAuth}@${node.server}:${node.port}`;
                if (node.plugin) {
                    ssUrl += `?plugin=${encodeURIComponent(node.plugin)}`;
                    if (node.pluginOpts) {
                        ssUrl += `&plugin-opts=${encodeURIComponent(JSON.stringify(node.pluginOpts))}`;
                    }
                }
                ssUrl += `#${encodeURIComponent(node.name)}`;
                return ssUrl;
            case 'ssr':
                const ssrContent = `${node.server}:${node.port}:${node.protocol}:${node.method}:${node.obfs}:${Buffer.from(node.password || '').toString('base64')}`;
                const ssrParams = new URLSearchParams();
                ssrParams.set('remarks', Buffer.from(node.name).toString('base64'));
                if (node.protocolParam)
                    ssrParams.set('protoparam', Buffer.from(node.protocolParam).toString('base64'));
                if (node.obfsParam)
                    ssrParams.set('obfsparam', Buffer.from(node.obfsParam).toString('base64'));
                return `ssr://${Buffer.from(`${ssrContent}/?${ssrParams.toString()}`).toString('base64')}`;
            case 'vmess':
                const vmessData = {
                    v: '2',
                    ps: node.name,
                    add: node.server,
                    port: node.port,
                    id: node.uuid,
                    aid: node.alterId,
                    scy: node.scy || 'auto',
                    net: node.network,
                    type: 'none',
                    host: '',
                    path: '',
                    tls: node.tls ? 'tls' : '',
                    sni: node.sni || '',
                    alpn: node.alpn ? node.alpn.join(',') : ''
                };
                if (node.ws) {
                    vmessData.path = node.ws.path;
                    if (node.ws.headers?.Host)
                        vmessData.host = node.ws.headers.Host;
                }
                else if (node.h2) {
                    vmessData.path = node.h2.path;
                    if (node.h2.host?.length)
                        vmessData.host = node.h2.host.join(',');
                }
                else if (node.grpc) {
                    vmessData.path = node.grpc.serviceName;
                }
                return `vmess://${Buffer.from(JSON.stringify(vmessData)).toString('base64')}`;
            case 'vless':
                let vless = `vless://${node.uuid}@${node.server}:${node.port}?encryption=none&type=${node.network || 'tcp'}`;
                if (node.reality) {
                    vless += '&security=reality';
                    if (node.reality.publicKey)
                        vless += `&pbk=${node.reality.publicKey}`;
                    if (node.reality.shortId)
                        vless += `&sid=${node.reality.shortId}`;
                    if (node.reality.sni)
                        vless += `&sni=${node.reality.sni}`;
                }
                else if (node.tls) {
                    vless += '&security=tls';
                    if (node.sni)
                        vless += `&sni=${encodeURIComponent(node.sni)}`;
                    if (node.alpn)
                        vless += `&alpn=${encodeURIComponent(node.alpn.join(','))}`;
                    if (node.fingerprint)
                        vless += `&fp=${node.fingerprint}`;
                }
                if (node.flow)
                    vless += `&flow=${node.flow}`;
                if (node.ws) {
                    if (node.ws.path)
                        vless += `&path=${encodeURIComponent(node.ws.path)}`;
                    if (node.ws.headers?.Host)
                        vless += `&host=${encodeURIComponent(node.ws.headers.Host)}`;
                }
                else if (node.grpc) {
                    if (node.grpc.serviceName)
                        vless += `&serviceName=${encodeURIComponent(node.grpc.serviceName)}`;
                }
                else if (node.h2) {
                    if (node.h2.path)
                        vless += `&path=${encodeURIComponent(node.h2.path)}`;
                    if (node.h2.host?.length)
                        vless += `&host=${encodeURIComponent(node.h2.host.join(','))}`;
                }
                vless += `#${encodeURIComponent(node.name)}`;
                return vless;
            case 'trojan':
                let trojan = `trojan://${encodeURIComponent(node.password || '')}@${node.server}:${node.port}?`;
                const trojanParams = new URLSearchParams();
                if (node.sni)
                    trojanParams.set('sni', node.sni);
                if (node.alpn)
                    trojanParams.set('alpn', node.alpn.join(','));
                if (node.fingerprint)
                    trojanParams.set('fp', node.fingerprint);
                if (node.network && node.network !== 'tcp') {
                    trojanParams.set('type', node.network);
                    if (node.ws) {
                        if (node.ws.path)
                            trojanParams.set('path', node.ws.path);
                        if (node.ws.headers?.Host)
                            trojanParams.set('host', node.ws.headers.Host);
                    }
                    else if (node.grpc) {
                        if (node.grpc.serviceName)
                            trojanParams.set('serviceName', node.grpc.serviceName);
                    }
                }
                trojan += trojanParams.toString() + `#${encodeURIComponent(node.name)}`;
                return trojan;
            case 'hysteria':
            case 'hysteria2':
                const hyProtocol = node.type === 'hysteria2' ? 'hysteria2' : 'hysteria';
                let hy = `${hyProtocol}://${node.password || node.auth}@${node.server}:${node.port}?`;
                const hyParams = new URLSearchParams();
                if (node.obfs)
                    hyParams.set('obfs', node.obfs);
                if (node.obfsParam)
                    hyParams.set('obfsParam', node.obfsParam);
                if (node.obfsParam)
                    hyParams.set('obfsParam', node.obfsParam);
                if (node.up)
                    hyParams.set('up', String(node.up));
                if (node.down)
                    hyParams.set('down', String(node.down));
                if (node.sni)
                    hyParams.set('sni', node.sni);
                if (node.insecure)
                    hyParams.set('insecure', '1');
                hy += hyParams.toString() + `#${encodeURIComponent(node.name)}`;
                return hy;
            case 'tuic': // Fix password undefined check
                let tuic = `tuic://${node.uuid}:${encodeURIComponent(node.password || '')}@${node.server}:${node.port}?`;
                const tuicParams = new URLSearchParams();
                if (node.congestionControl)
                    tuicParams.set('congestion_control', node.congestionControl);
                if (node.udpRelayMode)
                    tuicParams.set('udp_relay_mode', node.udpRelayMode);
                if (node.sni)
                    tuicParams.set('sni', node.sni);
                if (node.allowInsecure)
                    tuicParams.set('allow_insecure', '1');
                tuic += tuicParams.toString() + `#${encodeURIComponent(node.name)}`;
                return tuic;
            case 'ss2022':
                // Same as SS for base64
                // ... handled above if type uses 'ss'
                return null;
            case 'wireguard':
                // valid wireguard:// schema
                let wg = `wireguard://${encodeURIComponent(node.privateKey || '')}@${node.server}:${node.port}?`;
                const wgParams = new URLSearchParams();
                if (node.publicKey)
                    wgParams.set('publicKey', node.publicKey);
                if (node.ip)
                    wgParams.set('ip', node.ip);
                if (node.mtu)
                    wgParams.set('mtu', node.mtu.toString());
                return wg + wgParams.toString() + `#${encodeURIComponent(node.name)}`;
            case 'brook':
                // brook://server:port:password
                return `brook://${node.server}:${node.port}:${encodeURIComponent(node.password || '')}#${encodeURIComponent(node.name)}`;
            case 'snell':
                // snell://...
                let snell = `snell://${node.psk}@${node.server}:${node.port}?`;
                const snellParams = new URLSearchParams();
                if (node.version)
                    snellParams.set('version', node.version.toString());
                if (node.obfs)
                    snellParams.set('obfs', node.obfs);
                return snell + snellParams.toString() + `#${encodeURIComponent(node.name)}`;
            default:
                return '';
        }
    }).filter(Boolean);
    return Buffer.from(links.join('\n')).toString('base64');
}
// SingBox 格式 - 修正版
function convertToSingBox(nodes, options) {
    const outbounds = nodes.map(node => {
        const base = {
            tag: node.name,
            server: node.server,
            server_port: node.port
        };
        switch (node.type) {
            case 'ss':
                const ss = {
                    ...base,
                    type: 'shadowsocks',
                    method: node.method,
                    password: node.password
                };
                if (node.plugin) {
                    ss.plugin = node.plugin;
                    ss.plugin_opts = node.pluginOpts;
                }
                return ss;
            case 'vmess':
                const vmess = {
                    ...base,
                    type: 'vmess',
                    uuid: node.uuid,
                    alter_id: node.alterId,
                    security: node.scy || 'auto'
                };
                if (node.tls) {
                    vmess.tls = {
                        enabled: true,
                        server_name: node.sni || node.ws?.headers?.Host || node.server,
                        insecure: options.skipCert
                    };
                    if (node.alpn)
                        vmess.tls.alpn = node.alpn;
                }
                if (node.network && node.network !== 'tcp') {
                    vmess.transport = { type: node.network };
                    if (node.ws) {
                        vmess.transport.path = node.ws.path;
                        vmess.transport.headers = node.ws.headers;
                    }
                    else if (node.h2) {
                        vmess.transport.path = node.h2.path;
                        vmess.transport.host = node.h2.host;
                    }
                    else if (node.grpc) {
                        vmess.transport.service_name = node.grpc.serviceName;
                    }
                }
                return vmess;
            case 'vless':
                const vless = {
                    ...base,
                    type: 'vless',
                    uuid: node.uuid
                };
                if (node.flow)
                    vless.flow = node.flow;
                if (node.tls) {
                    vless.tls = {
                        enabled: true,
                        server_name: node.reality?.sni || node.sni || node.ws?.headers?.Host || node.server,
                        insecure: options.skipCert
                    };
                    if (node.alpn)
                        vless.tls.alpn = node.alpn;
                    if (node.reality) {
                        vless.tls.reality = {
                            enabled: true,
                            public_key: node.reality.publicKey,
                            short_id: node.reality.shortId
                        };
                    }
                }
                if (node.network && node.network !== 'tcp') {
                    vless.transport = { type: node.network };
                    if (node.ws) {
                        vless.transport.path = node.ws.path;
                        vless.transport.headers = node.ws.headers;
                    }
                    else if (node.grpc) {
                        vless.transport.service_name = node.grpc.serviceName;
                    }
                    else if (node.h2) {
                        vless.transport.path = node.h2.path;
                        vless.transport.host = node.h2.host;
                    }
                }
                return vless;
            case 'trojan':
                const trojan = {
                    ...base,
                    type: 'trojan',
                    password: node.password
                };
                if (node.sni || node.tls) {
                    trojan.tls = {
                        enabled: true,
                        server_name: node.sni || node.server,
                        insecure: options.skipCert
                    };
                    if (node.alpn)
                        trojan.tls.alpn = node.alpn;
                }
                if (node.network && node.network !== 'tcp') {
                    trojan.transport = { type: node.network };
                    if (node.ws) {
                        trojan.transport.path = node.ws.path;
                        trojan.transport.headers = node.ws.headers;
                    }
                    else if (node.grpc) {
                        trojan.transport.service_name = node.grpc.serviceName;
                    }
                }
                return trojan;
            case 'hysteria':
            case 'hysteria2':
                return {
                    ...base,
                    type: node.type,
                    password: node.password || node.auth,
                    up_mbps: parseInt(String(node.up || 10)),
                    down_mbps: parseInt(String(node.down || 50)),
                    obfs: node.obfs ? { type: node.obfs, password: node.obfsParam || '' } : undefined,
                    tls: {
                        enabled: true,
                        server_name: node.sni || node.server,
                        insecure: node.insecure || options.skipCert,
                        alpn: node.alpn || ['h3']
                    }
                };
            case 'tuic':
                return {
                    ...base,
                    type: 'tuic',
                    uuid: node.uuid,
                    password: node.password,
                    congestion_control: node.congestionControl || 'bbr',
                    udp_relay_mode: node.udpRelayMode || 'native',
                    tls: {
                        enabled: true,
                        server_name: node.sni || node.server,
                        insecure: node.allowInsecure || options.skipCert,
                        alpn: node.alpn || ['h3']
                    }
                };
            case 'wireguard':
                // Single object for sing-box wireguard
                const wireguard = {
                    ...base,
                    type: 'wireguard',
                    local_address: node.ipv6 ? [node.ip, node.ipv6] : [node.ip],
                    private_key: node.privateKey,
                    server_port: node.port,
                    peer_public_key: node.publicKey,
                    pre_shared_key: node.preSharedKey,
                    mtu: node.mtu
                };
                return wireguard;
            case 'ss2022':
                return {
                    ...base,
                    type: 'shadowsocks',
                    method: node.method,
                    password: node.password
                };
            default:
                return null;
        }
    }).filter(Boolean);
    const config = {
        log: {
            level: 'info'
        },
        dns: {
            servers: [
                {
                    tag: 'google',
                    address: 'tls://8.8.8.8'
                }
            ]
        },
        inbounds: [
            {
                type: 'mixed',
                tag: 'mixed-in',
                listen: '127.0.0.1',
                listen_port: 1080
            }
        ],
        outbounds: [
            {
                type: 'selector',
                tag: 'proxy',
                outbounds: outbounds.map(o => o.tag)
            },
            ...outbounds,
            {
                type: 'direct',
                tag: 'direct'
            },
            {
                type: 'block',
                tag: 'block'
            }
        ],
        route: {
            rules: [
                {
                    outbound: 'proxy'
                }
            ]
        }
    };
    return JSON.stringify(config, null, 2);
}
// 辅助函数：解析插件参数
function parsePluginOpts(opts) {
    if (!opts)
        return {};
    if (typeof opts === 'object')
        return opts;
    try {
        // Try parsing as JSON first
        return JSON.parse(opts);
    }
    catch (e) {
        return opts;
    }
}
