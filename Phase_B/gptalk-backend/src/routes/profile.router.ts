import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { postResult, getUserProfile } from '../controllers/user-profile.controller';
import { validateProfile } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route GET /api/profile/:email
 * @description get the user profile
 * @access public
 */
router.get('/:email', validateProfile, validator, authMiddleware, getUserProfile);

/**
 * @route POST /api/profile/postResult
 * @description Adds the user's lesson results to the database
 * @access public
 */
router.post('/postResult', postResult);

export default router;
