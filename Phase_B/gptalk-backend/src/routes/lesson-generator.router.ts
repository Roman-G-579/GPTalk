import { Router } from 'express';
import { generateLessonMiddleware } from '../controllers/lesson-generator.controller';

const router = Router();

/**
 * @route POST /api/generateLesson
 * @description generate a lesson using the OpenAI API
 * @access public
 */
router.post('/', generateLessonMiddleware);

export default router;
