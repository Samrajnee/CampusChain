import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { createRequestSchema } from './mentorship.validation.js';
import * as controller from './mentorship.controller.js';

const router = Router();

router.use(authenticate);

// Anyone authenticated can list and view
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Students create requests
router.post('/', validate(createRequestSchema), controller.create);

// TEACHER+ can accept pending requests
router.patch('/:id/accept', authorize('TEACHER'), controller.accept);

// Participant or HOD+ can complete
router.patch('/:id/complete', controller.complete);

// Mentee or HOD+ can cancel
router.patch('/:id/cancel', controller.cancel);

// HOD+ can force close
router.patch('/:id/close', authorize('HOD'), controller.close);

export default router;