import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserProfile } from '../controllers/user-profile.controller';
import { validateProfile } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route GET /api/profile
 * @description register a user to the website
 * @access public
 */
router.get('/', validateProfile, validator, authMiddleware, getUserProfile);

export default router;
