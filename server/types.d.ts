
export interface ProxyNode {
    type: string;
    name: string;
    server: string;
    port: number;
    password?: string;
    uuid?: string;
    cipher?: string; // SS/Trojan
    method?: string; // SS
    network?: string; // generic transport
    net?: string; // VMess legacy

    // WireGuard
    privateKey?: string;
    publicKey?: string;
    preSharedKey?: string;
    ip?: string;
    ipv6?: string;
    mtu?: number;
    reserved?: number[];

    // VLESS/VMess/Trojan
    flow?: string;
    udp?: boolean;
    tls?: boolean | object;
    sni?: string;
    alpn?: string[];
    scy?: string; // VMess security
    alterId?: number; // VMess

    // Details
    ws?: {
        path: string;
        headers?: Record<string, string>;
    };
    h2?: {
        path: string;
        host?: string[];
    };
    grpc?: {
        serviceName: string;
    };
    quic?: {
        security: string;
        key: string;
        type: string;
    };
    reality?: {
        publicKey: string;
        shortId: string;
        sni?: string;
    };

    // Sub-fields
    plugin?: string;
    pluginOpts?: string | Record<string, any>;

    // Hysteria/TUIC
    up?: number | string;
    down?: number | string;
    auth?: string;
    obfs?: string;
    obfsParam?: string;
    protocolParam?: string; // SSR
    protocol?: string;
    insecure?: boolean;
    allowInsecure?: boolean; // TUIC
    fingerprint?: string; // VLESS/Trojan
    congestionControl?: string; // TUIC
    udpRelayMode?: string; // TUIC
    dns?: string; // WireGuard

    // Snell
    psk?: string;
    version?: number;
    obfsOpts?: {
        mode?: string;
        host?: string;
        uri?: string;
    };
}
