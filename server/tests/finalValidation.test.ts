
import { describe, test, expect, beforeAll } from '@jest/globals'
import { parseSubscription } from '../utils/parsers'
import { convertToTarget } from '../utils/converters'
import QRCode from 'qrcode'

// 1. 定义全协议测试样本 (模拟极其复杂的真实场景)
const complexNodes = {
    // Shadowsocks: SIP002 (with plugin), Legacy (Base64), Plain
    ss_sip002: 'ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ=@1.2.3.4:8388/?plugin=v2ray-plugin%3Bmode%3Dwebsocket%3Bhost%3Dexample.com#SS%20SIP002',
    ss_legacy: 'ss://YWVzLTI1Ni1nY206cGFzc3dvcmRAMS4yLjMuNDo4Mzg4#SS%20Legacy',

    // SSR: Base64 encoded param string
    ssr: 'ssr://MS4yLjMuNDo4Mzg4OmF1dGhfYWVzMTI4X21kNTphZXMtMTI4LWN0cjpwbGFpbjpXVzVqYjJ0bGQyRnVaQzV0YjI1bi8_b2Jmc3BhcmFtPSZwcm90b3BhcmFtPSZyZW1hcmtzPVUxc1NmUSZncm91cD1SMUpQVlE',

    // VMess: WS, TCP, GRPC, H2
    vmess_ws: 'vmess://eyJ2IjoiMiIsInBzIjoiVk1lc3MgV1MiLCJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImZmZmZmZmZmLWZmZmYtZmZmZi1mZmZmLWZmZmZmZmZmZmZmZiIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoibm9uZSIsImhvc3QiOiJleGFtcGxlLmNvbSIsInBhdGgiOiIvcGF0aCIsInRscyI6InRscyIsInNuaSI6ImV4YW1wbGUuY29tIn0=',

    // VLESS: Reality, TLS, TCP, GRPC
    vless_reality: 'vless://uuid@example.com:443?encryption=none&security=reality&sni=example.com&fp=chrome&pbk=publicKey&sid=shortId&type=grpc&serviceName=grpc#VLESS%20Reality',

    // Trojan: WS, TCP
    trojan_ws: 'trojan://password@example.com:443?security=tls&type=ws&host=example.com&path=%2Ftrojan#Trojan%20WS',

    // Hysteria 2
    hysteria2: 'hysteria2://password@example.com:443?sni=example.com&obfs=salamander&obfs-password=password#Hysteria2',

    // TUIC
    tuic: 'tuic://uuid:password@example.com:443?sni=example.com&congestion_control=bbr#TUIC'
}

describe('Final Comprehensive Validation', () => {

    describe('1. Parsing Reliability (解析可靠性)', () => {
        for (const [name, link] of Object.entries(complexNodes)) {
            test(`Should correctly parse ${name}`, async () => {
                const results = await parseSubscription(link)
                expect(results).toHaveLength(1)
                const node = results[0]
                expect(node.name).toBeTruthy()
                expect(node.server).toBeTruthy()
                expect(node.port).toBeGreaterThan(0)

                // Specific check for VLESS Reality
                if (name === 'vless_reality') {
                    expect(node.tls).toBe(true)
                    expect(node.fingerprint).toBeDefined() // Reality implies specific alpn/fp usually
                }
            })
        }
    })

    describe('2. Cross-Protocol Conversion Matrix (互转矩阵)', () => {
        // We will convert ALL nodes to ALL targets and check structural integrity
        const targets = ['clash', 'surge', 'quantumultx', 'shadowrocket', 'singbox', 'loon']

        let allParsedNodes: any[] = []

        beforeAll(async () => {
            const promises = Object.values(complexNodes).map(l => parseSubscription(l))
            const raw = await Promise.all(promises)
            allParsedNodes = raw.flat()
        })

        for (const target of targets) {
            test(`Global Convert to [${target}]`, () => {
                const output = convertToTarget(allParsedNodes, target, { udp: true })
                expect(output).toBeTruthy()
                const outputStr = typeof output === 'string' ? output : JSON.stringify(output)

                // 2.1 Basic Integrity Check
                expect(outputStr.length).toBeGreaterThan(50)

                // 2.2 Target-Specific Validation
                if (target === 'clash') {
                    expect(outputStr).toContain('proxies:')
                    expect(outputStr).toContain('type: ss')
                    expect(outputStr).toContain('type: vmess')
                    // Hysteria2 in Clash Meta
                    expect(outputStr).toContain('type: hysteria2')
                } else if (target === 'singbox') {
                    expect(outputStr).toContain('"outbounds":')
                    expect(outputStr).toContain('"type": "shadowsocks"')
                    expect(outputStr).toContain('"type": "hysteria2"')
                } else if (target === 'shadowrocket') {
                    // Base64 decoded check
                    const plain = Buffer.from(outputStr, 'base64').toString('utf-8')
                    expect(plain).toContain('ss://')
                    expect(plain).toContain('vmess://')
                    expect(plain).toContain('hysteria2://')
                }
            })
        }
    })

    describe('3. QR Code Generation (二维码生成)', () => {
        test('Should generate valid Data URI for parsed links', async () => {
            // Take a complex link (VLESS Reality) which is long
            const link = complexNodes.vless_reality
            // Generate QR
            const qrDataUrl = await QRCode.toDataURL(link)
            expect(qrDataUrl).toMatch(/^data:image\/png;base64,/)
        })
    })

    describe('4. Protocol-Specific Edge Cases (协议边缘情况)', () => {
        test('SS SIP002 should handle plugin parameters correctly', async () => {
            const nodes = await parseSubscription(complexNodes.ss_sip002)
            const clash = convertToTarget(nodes, 'clash', {})
            // Clash output for SS plugin should have 'plugin: v2ray-plugin'
            expect(clash).toContain('plugin: v2ray-plugin')
            expect(clash).toContain('plugin-opts:')
        })

        test('VLESS Reality should output correct flow/pbk/sid', async () => {
            const nodes = await parseSubscription(complexNodes.vless_reality)
            const singbox = convertToTarget(nodes, 'singbox', {})
            // Singbox JSON check
            const json = JSON.parse(singbox)
            const realityNode = json.outbounds.find((o: any) => o.tag === 'VLESS Reality')
            expect(realityNode).toBeDefined()
            expect(realityNode.tls).toBeDefined()
            expect(realityNode.tls.reality).toBeDefined()
            expect(realityNode.tls.reality.public_key).toBe('publicKey')
            expect(realityNode.tls.reality.short_id).toBe('shortId')
        })
    })

})
