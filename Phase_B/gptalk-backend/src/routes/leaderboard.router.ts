import { Router } from 'express';
import { getTopUsers } from '../controllers/leaderboard.controller';

const router = Router();

/**
 * @route GET /api/leaderboard
 * @description get the top 10 users
 * @access public
 */
router.get('/', getTopUsers);

export default router;
