import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './notifications.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);
router.patch('/mark-all-read', controller.markAllRead);
router.delete('/clear-read', controller.clearRead);
router.delete('/:id', controller.remove);

export default router;