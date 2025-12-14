import { parentPort } from 'node:worker_threads'
import { parseSubscription, addEmoji } from './parsers'
import { convertToTarget } from './converters'
import { ProxyNode } from '../types'

// Simple logging helper for worker
const log = (msg: string) => {
    // console.log(`[Worker] ${msg}`)
}

if (!parentPort) {
    throw new Error('This file must be run as a worker thread')
}

try {
    parentPort.on('message', async (task: any) => {
        const { id, content, target, options } = task
        const { include, exclude, sort, emoji, rename, udp, skipCert } = options || {}

        try {
            log(`Processing task ${id} for target ${target}`)

            // 1. Parsing
            let nodes: ProxyNode[] = parseSubscription(content)

            if (!nodes || nodes.length === 0) {
                parentPort!.postMessage({ id, error: 'No nodes found', result: null })
                return
            }

            // 2. Processing (Filter, Sort, Rename, Emoji)
            if (include) {
                const keywords = (include as string).split('|')
                nodes = nodes.filter(node => keywords.some(kw => node.name.includes(kw)))
            }

            if (exclude) {
                const keywords = (exclude as string).split('|')
                nodes = nodes.filter(node => !keywords.some(kw => node.name.includes(kw)))
            }

            if (sort === '1') {
                nodes.sort((a, b) => a.name.localeCompare(b.name))
            }

            if (emoji === '1') {
                nodes = nodes.map(node => ({ ...node, name: addEmoji(node.name) }))
            }

            if (rename) {
                const rules = (rename as string).split('\n').filter(r => r.includes('->'))
                nodes = nodes.map(node => {
                    let newName = node.name
                    for (const rule of rules) {
                        const [from, to] = rule.split('->')
                        newName = newName.replace(new RegExp(from.trim(), 'g'), to.trim())
                    }
                    return { ...node, name: newName }
                })
            }

            // 3. Conversion
            const result = convertToTarget(nodes, target, { udp, skipCert })

            // 4. Send back result
            parentPort!.postMessage({ id, result, count: nodes.length })

        } catch (err: any) {
            console.error('[Worker Error]', err)
            parentPort!.postMessage({ id, error: err.message || 'Unknown error' })
        }
    })
} catch (e) {
    console.error('[Worker Startup Error]', e)
}
