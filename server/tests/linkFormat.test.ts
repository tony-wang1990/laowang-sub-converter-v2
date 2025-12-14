
import { describe, test, expect, beforeAll } from '@jest/globals'
import { parseSubscription } from '../utils/parsers'
import { convertToTarget } from '../utils/converters'

// 测试节点示例
const testNodes = {
    ss: 'ss://YWVzLTI1Ni1nY206dGVzdHBhc3M=@example.com:8388#SS%20Test',
    ssSIP002: 'ss://YWVzLTI1Ni1nY206dGVzdA==@example.com:443?plugin=v2ray-plugin&plugin-opts=obfs%3Dtls#SS%20SIP002',
    ssr: 'ssr://ZXhhbXBsZS5jb206NDQzOmF1dGhfYWVzMTI4X21kNTphZXMtMjU2LWNmYjp0bHMxLjJfdGlja2V0X2F1dGg6ZEdWemRBLz9vYmZzcGFyYW09JnByb3RvcGFyYW09JnJlbWFya3M9VTFOU1ZHVnpkQSZncm91cD1WMlYwZEE',
    vmess: 'vmess://eyJ2IjoiMiIsInBzIjoiVk1lc3MgVGVzdCIsImFkZCI6ImV4YW1wbGUuY29tIiwicG9ydCI6IjQ0MyIsImlkIjoiNDJmZWNhOTktZmQzOC00MjFiLWIwNGItZGZhODhkMGU0NmM4IiwiYWlkIjoiMCIsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIiwiaG9zdCI6ImV4YW1wbGUuY29tIiwicGF0aCI6Ii9wYXRoIiwidGxzIjoidGxzIiwic25pIjoiZXhhbXBsZS5jb20ifQ==',
    vless: 'vless://42feca99-fd38-421b-b04b-dfa88d0e46c8@example.com:443?encryption=none&security=tls&sni=example.com&type=ws&host=example.com&path=%2Fpath#VLESS%20Test',
    vlessReality: 'vless://42feca99-fd38-421b-b04b-dfa88d0e46c8@example.com:443?encryption=none&security=reality&pbk=publickey123&sid=short123&sni=example.com&type=grpc&serviceName=grpcservice#VLESS%20Reality',
    trojan: 'trojan://password123@example.com:443?sni=example.com&alpn=h2,http/1.1&fp=chrome#Trojan%20Test',
    trojanWS: 'trojan://password123@example.com:443?type=ws&path=%2Fpath&host=example.com&sni=example.com#Trojan%20WS',
    hysteria2: 'hysteria2://password@example.com:443?sni=example.com&obfs=salamander&obfsParam=secret#Hysteria2%20Test',
    tuic: 'tuic://42feca99-fd38-421b-b04b-dfa88d0e46c8:password@example.com:443?congestion_control=bbr&alpn=h3&sni=example.com#TUIC%20Test'
}

describe('Link Format Verification', () => {

    describe('1. Protocol Parsing', () => {
        for (const [protocol, link] of Object.entries(testNodes)) {
            test(`${protocol} should simplify parse successfully`, async () => {
                const parsed = await parseSubscription(link)
                expect(parsed).toBeDefined()
                expect(parsed.length).toBeGreaterThan(0)
                expect(parsed[0]).toHaveProperty('type', (protocol === 'ss' || protocol === 'ssr' || protocol === 'ssSIP002') ? (protocol === 'ssr' ? 'ssr' : 'ss') : protocol.replace('WS', '').replace('Reality', ''))
            })
        }
    })

    describe('2. Format Conversion', () => {
        let parsedNodes: any[] = []

        beforeAll(async () => {
            const promises = Object.values(testNodes).map(link => parseSubscription(link))
            const results = await Promise.all(promises)
            parsedNodes = results.flat()
        })

        const targets = ['clash', 'surge', 'quantumultx', 'loon', 'shadowrocket', 'singbox']
        const options = { udp: true, skipCert: false }

        for (const target of targets) {
            test(`should convert to ${target} successfully`, () => {
                const output = convertToTarget(parsedNodes, target, options)
                expect(output).toBeDefined()
                expect(output.length).toBeGreaterThan(0)
                // Basic format check
                if (target === 'clash') expect(output).toContain('proxies:')
                if (target === 'singbox') expect(output).toContain('"outbounds":')
            })
        }
    })

    describe('3. Generated Link Validation (Base64)', () => {
        let parsedNodes: any[] = []
        let decodedLinks: string[] = []

        beforeAll(async () => {
            const promises = Object.values(testNodes).map(link => parseSubscription(link))
            const results = await Promise.all(promises)
            parsedNodes = results.flat()

            const base64Output = convertToTarget(parsedNodes, 'shadowrocket', {})
            expect(base64Output).toBeDefined()
            decodedLinks = Buffer.from(base64Output, 'base64').toString('utf-8').split('\n').filter(l => l.trim())
        })

        test('SS link format', () => {
            const link = decodedLinks.find(l => l.startsWith('ss://'))
            if (link) {
                // Check if it's SIP002 or legacy base64
                // Just ensure it's valid enough
                expect(link).toMatch(/^ss:\/\/.+/)
            }
        })

        test('VLESS link format', () => {
            const link = decodedLinks.find(l => l.startsWith('vless://'))
            if (link) {
                expect(link).toContain('encryption=')
                expect(link).toContain('security=')
            }
        })

        test('Trojan link format', () => {
            const link = decodedLinks.find(l => l.startsWith('trojan://'))
            if (link) {
                expect(link).toContain('@')
            }
        })

        test('VMess link format', () => {
            const link = decodedLinks.find(l => l.startsWith('vmess://'))
            if (link) {
                const jsonPart = link.replace('vmess://', '')
                const decoded = JSON.parse(Buffer.from(jsonPart, 'base64').toString())
                expect(decoded.v).toBeDefined()
                expect(decoded.add).toBeDefined()
                expect(decoded.port).toBeDefined()
            }
        })
    })
})
