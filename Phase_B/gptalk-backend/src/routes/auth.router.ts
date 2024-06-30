import router from './user.router';
import { getUserByTokenMiddleware, loginMiddleware } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @route POST /api/login
 * @description log a user in to the website
 * @access public
 */
router.post('/login', loginMiddleware);

/**
 * @route GET /api/user
 * @description get user info
 * @access jwt
 */
router.get('/user', authMiddleware, getUserByTokenMiddleware)

export default router;
