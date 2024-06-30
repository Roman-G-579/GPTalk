import { Express } from 'express-serve-static-core';
import { User } from './user.interface';

declare module 'express-serve-static-core' {
	interface Request {
		data?: any;
		user?: User;
	}
}
