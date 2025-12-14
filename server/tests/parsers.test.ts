import { parseSubscription } from '../utils/parsers.js'
import { jest, describe, test, expect } from '@jest/globals'

describe('Protocol Parser Tests', () => {

    test('should parse basic SS link', () => {
        const link = 'ss://YWVzLTI1Ni1nY206dGVzdHBhc3M=@1.2.3.4:8388#SS-Basic'
        const nodes = parseSubscription(link)
        expect(nodes).toHaveLength(1)
        expect(nodes[0]).toEqual(expect.objectContaining({
            type: 'ss',
            server: '1.2.3.4',
            port: 8388,
            name: 'SS-Basic'
        }))
    })

    test('should parse VMess link', () => {
        // vmess://{"v":"2","ps":"VMess-WS","add":"1.2.3.4","port":"443","id":"42feca99-fd38-421b-b04b-dfa88d0e46c8","aid":"0","scy":"auto","net":"ws","type":"none","host":"example.com","path":"/path","tls":"tls","sni":"example.com"}
        const link = 'vmess://eyJ2IjoiMiIsInBzIjoiVk1lc3MtV1MiLCJhZGQiOiIxLjIuMy40IiwicG9ydCI6IjQ0MyIsImlkIjoiNDJmZWNhOTktZmQzOC00MjFiLWIwNGItZGZhODhkMGU0NmM4IiwiYWlkIjoiMCIsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIiwiaG9zdCI6ImV4YW1wbGUuY29tIiwicGF0aCI6Ii9wYXRoIiwidGxzIjoidGxzIiwic25pIjoiZXhhbXBsZS5jb20ifQ=='
        const nodes = parseSubscription(link)
        expect(nodes).toHaveLength(1)
        expect(nodes[0].type).toBe('vmess')
        expect(nodes[0].network).toBe('ws')
    })

    test('should handle invalid links gracefully', () => {
        const link = 'invalid://link'
        const nodes = parseSubscription(link)
        expect(nodes).toHaveLength(0)
    })

    test('should parse WireGuard link', () => {
        const link = 'wireguard://privateKey@1.2.3.4:51820?publicKey=pubkey&ip=10.0.0.1#WG'
        const nodes = parseSubscription(link)
        expect(nodes).toHaveLength(1)
        expect(nodes[0].type).toBe('wireguard')
        expect(nodes[0].privateKey).toBe('privateKey')
    })

})
