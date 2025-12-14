
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
    // Check if we need to migrate subscriptions table
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='subscriptions'", [], (err, row) => {
        if (err) {
            console.error('Error checking table:', err)
            return
        }

        if (row) {
            // Check if table has new columns
            db.all("PRAGMA table_info(subscriptions)", [], (err, columns: any[]) => {
                if (err) {
                    console.error('Error getting table info:', err)
                    return
                }

                const hasGroupName = columns.some(col => col.name === 'group_name')

                if (!hasGroupName) {
                    console.log('Migrating subscriptions table to new schema...')
                    migrateSubscriptionsTable()
                }
            })
        } else {
            // Create new table with enhanced schema
            createSubscriptionsTable()
        }
    })

    // Create short_links table
    db.run(`
        CREATE TABLE IF NOT EXISTS short_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_code TEXT UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            clicks INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

function createSubscriptionsTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            group_name TEXT NOT NULL DEFAULT 'default',
            tags TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating subscriptions table:', err)
        else console.log('Subscriptions table created successfully')
    })
}

function migrateSubscriptionsTable() {
    db.serialize(() => {
        // Create new table with enhanced schema
        db.run(`
            CREATE TABLE subscriptions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                group_name TEXT NOT NULL DEFAULT 'default',
                tags TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Migrate existing data
        db.run(`
            INSERT INTO subscriptions_new (id, name, url, group_name, tags, description, created_at, updated_at)
            SELECT id, name, url, 'default', '', '', created_at, created_at FROM subscriptions
        `)

        // Drop old table
        db.run('DROP TABLE subscriptions')

        // Rename new table
        db.run('ALTER TABLE subscriptions_new RENAME TO subscriptions', (err) => {
            if (err) console.error('Migration error:', err)
            else console.log('✅ Subscriptions table migrated successfully')
        })
    })
}

export interface Subscription {
    id: number;
    name: string;
    url: string;
    group_name?: string;
    tags?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export const getSubscriptions = (): Promise<Subscription[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM subscriptions ORDER BY created_at DESC", [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as Subscription[])
        })
    })
}

export const addSubscription = (
    name: string,
    url: string,
    group_name: string = 'default',
    tags: string = '',
    description: string = ''
): Promise<Subscription> => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(
            "INSERT INTO subscriptions (name, url, group_name, tags, description) VALUES (?, ?, ?, ?, ?)"
        )
        stmt.run(name, url, group_name, tags, description, function (this: sqlite3.RunResult, err: Error | null) {
            if (err) reject(err)
            else resolve({ id: this.lastID, name, url, group_name, tags, description })
        })
        stmt.finalize()
    })
}

export const updateSubscription = (
    id: number,
    data: {
        name: string
        url: string
        group_name?: string
        tags?: string
        description?: string
    }
): Promise<Subscription> => {
    return new Promise((resolve, reject) => {
        const fields = ['name = ?', 'url = ?', 'updated_at = CURRENT_TIMESTAMP']
        const values: any[] = [data.name, data.url]

        if (data.group_name !== undefined) {
            fields.push('group_name = ?')
            values.push(data.group_name)
        }
        if (data.tags !== undefined) {
            fields.push('tags = ?')
            values.push(data.tags)
        }
        if (data.description !== undefined) {
            fields.push('description = ?')
            values.push(data.description)
        }

        values.push(id)

        db.run(
            `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
            values,
            function (this: sqlite3.RunResult, err: Error | null) {
                if (err) reject(err)
                else if (this.changes === 0) reject(new Error('Subscription not found'))
                else resolve({ id, ...data } as Subscription)
            }
        )
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

export const getGroups = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT DISTINCT group_name FROM subscriptions WHERE group_name IS NOT NULL ORDER BY group_name",
            [],
            (err, rows: any[]) => {
                if (err) reject(err)
                else resolve(rows.map(r => r.group_name))
            }
        )
    })
}

// Short Link Operations
export interface ShortLink {
    id: number;
    short_code: string;
    original_url: string;
    clicks: number;
    created_at?: string;
    updated_at?: string;
}

export const createShortLink = (shortCode: string, originalUrl: string): Promise<ShortLink> => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO short_links (short_code, original_url) VALUES (?, ?)")
        stmt.run(shortCode, originalUrl, function (this: sqlite3.RunResult, err: Error | null) {
            if (err) reject(err)
            else resolve({ id: this.lastID, short_code: shortCode, original_url: originalUrl, clicks: 0 })
        })
        stmt.finalize()
    })
}

export const getShortLinkByCode = (shortCode: string): Promise<ShortLink | null> => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM short_links WHERE short_code = ?", [shortCode], (err, row) => {
            if (err) reject(err)
            else resolve(row as ShortLink || null)
        })
    })
}

export const getAllShortLinks = (): Promise<ShortLink[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM short_links ORDER BY created_at DESC", [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as ShortLink[])
        })
    })
}

export const deleteShortLink = (id: number): Promise<{ deleted: number }> => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM short_links WHERE id = ?", [id], function (this: sqlite3.RunResult, err: Error | null) {
            if (err) reject(err)
            else resolve({ deleted: this.changes })
        })
    })
}

export const incrementShortLinkClicks = (shortCode: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE short_links SET clicks = clicks + 1, updated_at = CURRENT_TIMESTAMP WHERE short_code = ?",
            [shortCode],
            function (this: sqlite3.RunResult, err: Error | null) {
                if (err) reject(err)
                else resolve()
            }
        )
    })
}

export default db
