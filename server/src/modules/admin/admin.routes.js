import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import authorize  from '../../middleware/authorize.js';
import * as controller from './admin.controller.js';

const router = Router();

// All admin routes: authenticated + TEACHER minimum
router.use(authenticate);
router.use(authorize('TEACHER'));

router.get('/stats', controller.stats);
router.get('/students', controller.studentSearch);
router.get('/audit-logs', controller.auditLogs);
router.get('/pending', controller.pendingItems);

export default router;