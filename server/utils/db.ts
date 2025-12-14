
import sqlite3 from 'sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../database.sqlite')

// Initialize DB
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err)
    } else {
        console.log('Connected to SQLite database')
        initSchema()
    }
})

function initSchema() {
    db.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

export interface Subscription {
    id: number;
    name: string;
    url: string;
    created_at?: string;
}

export const getSubscriptions = (): Promise<Subscription[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM subscriptions ORDER BY created_at DESC", [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as Subscription[])
        })
    })
}

export const addSubscription = (name: string, url: string): Promise<Subscription> => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO subscriptions (name, url) VALUES (?, ?)")
        stmt.run(name, url, function (this: sqlite3.RunResult, err: Error | null) {
            if (err) reject(err)
            else resolve({ id: this.lastID, name, url })
        })
        stmt.finalize()
    })
}

export const deleteSubscription = (id: number): Promise<{ deleted: number }> => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM subscriptions WHERE id = ?", [id], function (this: sqlite3.RunResult, err: Error | null) {
            if (err) reject(err)
            else resolve({ deleted: this.changes })
        })
    })
}

export default db
