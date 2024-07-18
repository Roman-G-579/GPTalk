import { Router } from 'express';
import {generateLesson} from "../controllers/lesson-generator.controller";

const router = Router();

/**
 * @route POST /api/generateLesson
 * @description generate a lesson using the OpenAI API
 * @access public
 */
router.post('/', generateLesson);

export default router;
