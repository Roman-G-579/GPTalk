import { Router } from 'express';
import { fetchDailyWord } from '../controllers/daily-word.controller';

const router = Router();

/**
 * @route POST /api/daily-word/fetch
 * @description fetch a daily word from the database
 * @access public
 */
router.post('/fetch', fetchDailyWord);

export default router;
