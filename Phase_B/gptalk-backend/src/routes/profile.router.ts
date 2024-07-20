import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserProfile } from '../controllers/user-profile.controller';
import { validateProfile } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route GET /api/profile/:email
 * @description get the user profile
 * @access public
 */
router.get('/:email', validateProfile, validator, authMiddleware, getUserProfile);

export default router;
