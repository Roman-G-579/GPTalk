import { param, body } from 'express-validator';
import { Role } from '../models/user.interface';

export const validateMongoId = [param('id').exists().bail().isMongoId()];

export const validateUser = [
	body('username').exists().bail().isString().bail().notEmpty(),
	body('email').exists().bail().isEmail(),
	body('age').exists().bail().isInt({ min: 18 }),
	body('role').exists().bail().isIn(Object.values(Role)),
];
