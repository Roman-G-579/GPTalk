import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { UserModel } from '../models/user.interface';
import { Config } from './config';

const options: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: Config.JWT_SECRET,
};

export const jwtStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
	try {
		console.log(`JWT Payload: ${JSON.stringify(jwt_payload)}`); // Log the JWT payload

		const user = await UserModel.findOne({ email: jwt_payload.email });
		if (user) {
			console.log('User found:', user.email); // Log if user is found
			return done(null, user);
		} else {
			console.log('User not found'); // Log if user is not found
		}
		return done(null, false);
	} catch (err) {
		console.error('Error in JWT strategy:', err); // Log any error in the strategy
		return done(err, false);
	}
});
