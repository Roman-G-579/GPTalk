import router from './user.router';
import { loginMiddleware } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @route POST /api/login
 * @description register a user to the website
 * @access public
 */
router.post('/login', loginMiddleware);

//! TODO: REMOVE
// Protect routes with authMiddleware
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'You are authorized', user: req.user });
});

export default router;
