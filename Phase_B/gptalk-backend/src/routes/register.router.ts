import { Router } from 'express';
import { registerMiddleware } from '../controllers/register.controller';
import { validator } from '../middlewares/validator.middleware';
import { validateUser } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route POST /api/register
 * @description register a user to the website
 * @access public
 */
router.post('/', validateUser, validator, registerMiddleware);

export default router;
