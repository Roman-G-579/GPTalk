import { Router } from 'express';
import { chatWithMeMiddleware, gradeChatMiddleware } from '../controllers/chat-with-me.controller';

const router = Router();

/**
 * @route POST /api/chat-with-me/chat
 * @description chat with bot
 * @access public
 */
router.post('/chat', chatWithMeMiddleware);

/**
 * @route POST /api/chat-with-me/grade
 * @description calculate grade for the conversation
 * @access public
 */
router.post('/grade', gradeChatMiddleware);

export default router;