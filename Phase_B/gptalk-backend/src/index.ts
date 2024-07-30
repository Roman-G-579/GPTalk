import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import { jwtStrategy } from './config/passport.config';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';

import { connectToDb } from './config/db';
import { Config } from './config/config';
import { expressLogger } from './controllers/logger.controller';
import { errorMiddleware } from './middlewares/error.middleware';

// routers
import registerRouter from './routes/register.router';
import authRouter from './routes/auth.router';
import profileRouter from './routes/profile.router';
import lessonGeneratorRouter from './routes/lesson-generator.router';
import chatWithMeRouter from './routes/chat-with-me.router';

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

// JWT
passport.use(jwtStrategy);
app.use(passport.initialize());

// swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middlewares
app.get('/api/ping', (req, res) => {
	res.send({ name: Config.PACKAGE, port: Config.PORT, version: Config.VERSION });
});
app.use('/api/register', registerRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/generateLesson', lessonGeneratorRouter);
app.use('/api/chat-with-me', chatWithMeRouter);

// Error handler
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
