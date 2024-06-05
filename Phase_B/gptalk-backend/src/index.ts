import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';

import { connectToDb } from './config/db';
import { Config } from './config/config';
import { expressLogger } from './controllers/logger.controller';
import { errorMiddleware } from './middlewares/error.middleware';

// routers
import userRouter from './routes/user.router';

// initialize express server
const app = express();
const httpServer = createServer(app);
const swaggerDocument = YAML.load('src/swagger.yaml');

// helmet
app.use(helmet());

// cors
app.use(cors({ origin: true, credentials: true }));

// logger
app.use(expressLogger);

// body parser
app.use(express.json());

// swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middlewares
app.get('/api/ping', (req, res) => {
	res.send({ name: Config.PACKAGE, port: Config.PORT, version: Config.VERSION });
});
app.use('/api/user', userRouter);
app.use(errorMiddleware);

async function main() {
	// connect to database
	await connectToDb();

	httpServer.listen(Config.PORT, () => {
		console.log('> App is listening...');
		console.log(`> App Name: ${Config.PACKAGE}`);
		console.log(`> Version: ${Config.VERSION}`);
		console.log(`> Port: ${Config.PORT}\n`);
	});
}

main();
