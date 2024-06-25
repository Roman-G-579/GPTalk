import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import { User } from '../models/user.interface'; // Import the IUser interface

interface AuthenticatedRequest extends Request {
  user?: User; // Extend the Request interface to include user
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User, info: unknown) => {
    if (err) {
      console.error('Error in authMiddleware:', err); // Log any error
      return next(err);
    }
    if (!user) {
      console.log('Unauthorized access attempt'); // Log unauthorized access
      console.log(`Token: ${req.headers.authorization}`); // Log the token
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
    }
    req.user = user;
    console.log('User authenticated:', user.email); // Log authenticated user
    next();
  })(req, res, next);
};
