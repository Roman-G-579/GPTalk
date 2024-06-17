import { config } from 'dotenv';

config();

export class Config {
	public static DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/gptalk';

	public static PROTOCOL = process.env.PROTOCOL || 'http';

	public static HOSTNAME = process.env.HOSTNAME || 'localhost';

	public static PORT = parseInt(process.env.PORT) || 3000;

	public static PACKAGE = process.env.npm_package_name;

	public static VERSION = process.env.npm_package_version;

	public static ADMIN_EMAIL = process.env.ADMIN_EMAIL;

	public static ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

	public static SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
}
