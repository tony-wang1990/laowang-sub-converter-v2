
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { jest, describe, test, expect } from '@jest/globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const workerPath = path.join(__dirname, '../utils/worker.ts')

describe('Worker Thread Tests', () => {
    jest.setTimeout(30000)

    const sampleContent = `
ss://YWVzLTI1Ni1nY206cGFzc3dvcmRAMS4yLjMuNDo4Mzg4#Node A
ss://YWVzLTI1Ni1nY206cGFzc3dvcmRAMS4yLjMuNDo4Mzg5#Node B
vmess://eyJ2IjoiMiIsInBzIjoiVk1lc3MgQyIsImFkZCI6IjEuMi4zLjQiLCJwb3J0IjoiNDQzIiwiaWQiOiJ1dWlkIiwiYWlkIjoiMCIsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIiwiaG9zdCI6ImV4YW1wbGUuY29tIiwicGF0aCI6Ii8iLCJ0bHMiOiJ0bHMiLCJzbmkiOiJleGFtcGxlLmNvbSJ9
`

    const runWorker = (data: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            // Use tsx to support running TS worker directly
            const worker = new Worker(workerPath, {
                execArgv: ['--import', 'tsx']
            })
            worker.postMessage({ id: 1, ...data })
            worker.on('message', (msg) => {
                worker.terminate()
                if (msg.error) reject(new Error(msg.error))
                else resolve(msg)
            })
            worker.on('error', (err) => {
                worker.terminate()
                reject(err)
            })
        })
    }

    test('should parse and convert basic subscription', async () => {
        const result = await runWorker({
            content: sampleContent,
            target: 'clash',
            options: {}
        })
        expect(result.html).toContain('proxies:')
        expect(result.count).toBe(3)
    })

    test('should filter nodes (include)', async () => {
        const result = await runWorker({
            content: sampleContent,
            target: 'clash',
            options: { include: 'Node A' }
        })
        expect(result.html).toContain('Node A')
        expect(result.html).not.toContain('Node B')
        expect(result.count).toBe(1)
    })

    test('should sort nodes', async () => {
        const result = await runWorker({
            content: sampleContent,
            target: 'clash',
            options: { sort: '1' }
        })
        expect(result.count).toBe(3)
        // Basic check that it runs, sorting logic verification is in unit tests
    })

    test('should add emoji', async () => {
        const result = await runWorker({
            content: sampleContent,
            target: 'clash',
            options: { emoji: '1' }
        })
        expect(result.html).toContain('name: ')
        expect(result.count).toBe(3)
    })
})
