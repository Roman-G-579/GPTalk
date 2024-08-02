import { param, body } from 'express-validator';

export const validateMongoId = [param('id').exists().bail().isMongoId()];

export const validateUser = [
	body('username').exists().isString().notEmpty(),
	body('password').exists().isString().notEmpty(),
	body('firstName').exists().isString().notEmpty(),
	body('lastName').exists().isString().notEmpty(),
	body('email').exists().isEmail(),
];

export const validateProfile = [param('email').exists().isEmail()];
