
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface CustomWorker extends Worker {
    busy: boolean;
}

interface Task {
    id: number;
    data: any;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}

class WorkerPool {
    size: number;
    workers: CustomWorker[];
    queue: Task[];
    pending: Map<number, { resolve: (value: any) => void, reject: (reason?: any) => void }>;
    taskId: number;

    constructor(size = 2) {
        this.size = size
        this.workers = []
        this.queue = []
        this.pending = new Map()
        this.taskId = 0

        for (let i = 0; i < size; i++) {
            this.addWorker()
        }
    }

    addWorker() {
        const workerPath = path.join(__dirname, 'worker.ts') // Use .ts path for ts-node/tsx, or .js if compiled
        // In this dev environment with tsx, parsing .ts worker might require registration
        // For simplicity in migration, we assume tsx handles .ts imports or we point to compiled .js if needed.
        // Given we are running `tsx watch`, pointing to .ts is usually fine if we pass execArgv loader, 
        // but robust node worker with TS is tricky. 
        // Let's stick to 'worker.js' if we assume compilation, OR keep it dynamic.
        // However, since we renamed worker.js to worker.ts, we must point to worker.ts
        // BUT standard node worker doesn't understand .ts without loaders.
        // We might need to revert worker.ts rename or use a loader.
        // For now, let's assume we keep using .ts and the user runs with tsx which might handle it? 
        // Actually, no, new Worker('./worker.ts') fails in node without loader.
        // Crucial decision: Keep worker.js as partial TS or revert? 
        // Better: Point to 'worker.ts' but we need to ensure runtime supports it.
        // Let's assume the user uses `tsx` which patches imports, but workers are separate processes.
        // To support workers in tsx: `new Worker('./worker.ts', { execArgv: ['--import', 'tsx'] })`?
        // Wait, the safer bet for now to avoid "worker not found" or syntax errors is to KEEP it as .ts 
        // but run it carefully.
        // Let's use `worker.js` in the path if we are transpiling, 
        // OR `worker.ts` with correct execArgv if using ts-node/tsx.
        // Let's try pointing to `worker.ts` first.

        // Actually, if I renamed `worker.js` to `worker.ts`, `worker.js` no longer exists on disk.
        // So I MUST change the path to `worker.ts`.

        const worker = new Worker(path.join(__dirname, 'worker.ts'), {
            execArgv: ['--import', 'tsx/esm']
        }) as CustomWorker

        worker.on('message', (msg) => {
            const { id, result, error } = msg
            if (this.pending.has(id)) {
                const { resolve, reject } = this.pending.get(id)!
                this.pending.delete(id)
                if (error) reject(new Error(error))
                else resolve(result)
            }

            // Try next task
            if (this.queue.length > 0) {
                const next = this.queue.shift()!
                this.executeTask(worker, next)
            } else {
                worker.busy = false
            }
        })

        worker.on('error', (err) => {
            console.error('Worker error:', err)
            // Replace worker
            this.workers = this.workers.filter(w => w !== worker)
            this.addWorker()
        })

        worker.busy = false
        this.workers.push(worker)
    }

    executeTask(worker: CustomWorker, task: Task) {
        worker.busy = true
        const { id, data, resolve, reject } = task
        this.pending.set(id, { resolve, reject })
        worker.postMessage({ id, ...data })
    }

    run(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = ++this.taskId
            const task: Task = { id, data, resolve, reject }

            const idleWorker = this.workers.find(w => !w.busy)
            if (idleWorker) {
                this.executeTask(idleWorker, task)
            } else {
                this.queue.push(task)
            }
        })
    }
}

// Singleton instance
export const workerPool = new WorkerPool(Math.max(2, 4)) // Adjust based on CPU
