import { convertToTarget } from '../utils/converters.js'
import { ProxyNode } from '../types.js'
import { jest, describe, test, expect } from '@jest/globals'

describe('Format Converter Tests', () => {

    const mockNodes = [
        {
            type: 'ss',
            name: 'SS-Node',
            server: '1.2.3.4',
            port: 8388,
            method: 'aes-256-gcm',
            password: 'password'
        },
        {
            type: 'vmess',
            name: 'VMess-Node',
            server: '1.2.3.4',
            port: 443,
            uuid: 'uuid',
            net: 'ws',
            tls: true
        },
        {
            type: 'wireguard',
            name: 'WG-Node',
            server: '1.2.3.4',
            port: 51820,
            privateKey: 'priv',
            publicKey: 'pub',
            ip: '10.0.0.1'
        }
    ] as ProxyNode[]

    test('should convert to Clash format', () => {
        const result = convertToTarget(mockNodes, 'clash', { udp: true })
        expect(result).toContain('proxies:')
        expect(result).toContain('name: SS-Node')
        expect(result).toContain('type: ss')
        expect(result).toContain('name: VMess-Node')
        expect(result).toContain('type: vmess')
        expect(result).toContain('name: WG-Node')
        expect(result).toContain('type: wireguard')
    })

    test('should convert to SingBox format', () => {
        const result = convertToTarget(mockNodes, 'singbox', {})
        expect(result).toContain('"type": "shadowsocks"')
        expect(result).toContain('"type": "vmess"')
        expect(result).toContain('"type": "wireguard"')
        // Check structure
        const json = JSON.parse(result)
        expect(json.outbounds).toBeDefined()
        expect(json.outbounds.length).toBeGreaterThan(3) // Includes selectors/direct/block
    })

    test('should convert to Base64', () => {
        const result = convertToTarget(mockNodes, 'shadowrocket', {})
        // Should appear as base64 string
        expect(typeof result).toBe('string')
        expect(result).not.toContain('proxies:')
    })

    test('should handle unknown target gracefully', () => {
        const result = convertToTarget(mockNodes, 'unknown', {})
        expect(result).toBe('')
    })
})
