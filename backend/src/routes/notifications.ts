import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user!.userId);

    const unreadCount = (db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(req.user!.userId) as any).count;

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

notificationRouter.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user!.userId);

    res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification', details: err.message });
  }
});

notificationRouter.post('/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
    `).run(req.user!.userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications read', details: err.message });
  }
});
