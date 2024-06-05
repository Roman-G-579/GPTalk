import mongoose from 'mongoose';
import { Config } from './config';

export async function connectToDb() {
	try {
		console.log('> Trying to connect to DB');
		await mongoose.connect(Config.DB_URL);
		console.log('> Connected to DB');
	} catch (err) {
		console.log('> Error connecting to DB');
		process.exit(1);
	}
}
