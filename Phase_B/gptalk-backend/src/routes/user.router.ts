import { Router } from 'express';
import {
	addUserMiddleware,
	deleteUserMiddleware,
	editUserMiddleware,
	getUserMiddleware,
} from '../controllers/user.controller';
import { validator } from '../middlewares/validator.middleware';
import { validateMongoId, validateUser } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route POST /api/user/add
 * @description add a user to the database
 * @access public
 */
router.post('/add', validateUser, validator, addUserMiddleware);

/**
 * @route GET /api/user/get/:id
 * @description get a user from the database by the id
 * @access public
 */
router.get('/get/:id', validateMongoId, validator, getUserMiddleware);

/**
 * @route PATCH /api/user/edit/:id
 * @description edit a user in the database by the id
 * @access public
 */
router.patch('/edit/:id', validateMongoId, validateUser, validator, editUserMiddleware);

/**
 * @route DELETE /api/user/delete/:id
 * @description delete a user from the database
 * @access public
 */
router.delete('/delete/:id', validateMongoId, validator, deleteUserMiddleware);

export default router;
