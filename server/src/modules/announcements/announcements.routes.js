import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.validation.js';
import * as controller from './announcements.controller.js';

const router = Router();

// All announcement routes require authentication
router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.get('/:id', controller.getOne);

// Create, update, delete: TEACHER and above
router.post('/', authorize('TEACHER'), validate(createAnnouncementSchema), controller.create);
router.patch('/:id', authorize('TEACHER'), validate(updateAnnouncementSchema), controller.update);
router.delete('/:id', authorize('TEACHER'), controller.remove);

export default router;