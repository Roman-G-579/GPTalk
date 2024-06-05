import { config } from 'dotenv';

config();

export class Config {
	public static DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/gptalk';

	public static PROTOCOL = process.env.PROTOCOL || 'http';

	public static HOSTNAME = process.env.HOSTNAME || 'localhost';

	public static PORT = parseInt(process.env.PORT) || 3000;

	public static PACKAGE = process.env.npm_package_name;

	public static VERSION = process.env.npm_package_version;
}
