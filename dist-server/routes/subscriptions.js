import express from 'express';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription, getGroups } from '../utils/db.js';
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const subs = await getSubscriptions();
        res.json({ success: true, data: subs });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Unknown error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, url, group_name, tags, description } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, error: 'Name and URL are required' });
        }
        const sub = await addSubscription(name, url, group_name, tags, description);
        res.json({ success: true, data: sub });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Unknown error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, group_name, tags, description } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, error: 'Name and URL are required' });
        }
        const sub = await updateSubscription(parseInt(id), {
            name, url, group_name, tags, description
        });
        res.json({ success: true, data: sub });
    }
    catch (err) {
        const status = err.message === 'Subscription not found' ? 404 : 500;
        res.status(status).json({ success: false, error: err.message || 'Unknown error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteSubscription(parseInt(id));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Unknown error' });
    }
});
router.get('/groups', async (req, res) => {
    try {
        const groups = await getGroups();
        res.json({ success: true, data: groups });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Unknown error' });
    }
});
export default router;
