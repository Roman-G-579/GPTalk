import { Router } from 'express';
import { chatWithMeMiddleware, gradeChatMiddleware } from '../controllers/chat-with-me.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/chat-with-me/chat
 * @description chat with bot
 * @access jwt
 */
router.post('/chat', authMiddleware, chatWithMeMiddleware);

/**
 * @route POST /api/chat-with-me/grade
 * @description calculate grade for the conversation
 * @access jwt
 */
router.post('/grade', authMiddleware, gradeChatMiddleware);

export default router;