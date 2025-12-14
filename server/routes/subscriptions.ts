
import express, { Request, Response } from 'express'
import { getSubscriptions, addSubscription, deleteSubscription } from '../utils/db.js'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    try {
        const subs = await getSubscriptions()
        res.json({ success: true, data: subs })
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Unknown error' })
    }
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, url } = req.body
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' })
        }
        const sub = await addSubscription(name, url)
        res.json({ success: true, data: sub })
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Unknown error' })
    }
})

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await deleteSubscription(parseInt(id))
        res.json({ success: true })
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Unknown error' })
    }
})

export default router
