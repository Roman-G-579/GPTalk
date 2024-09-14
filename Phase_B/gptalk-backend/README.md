<h1 align="center">GPTalk Backend</h1>

<p align="center" width="100%">
    <a href="#"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" title="TypeScript"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" title="Node.js"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" title="Express.js"/></a>
    <a href="#"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" title="MongoDB"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" title="Jest"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" title="Docker"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" title="Swagger"/></a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Usage](#usage)
- [.env file](#env-file)
- [cross-env](#cross-env)
- [Unit Testing](#unit-testing)
- [Swagger](#swagger)
- [Examples](#examples)
	- [enum, interface and schema](#enum-interface-and-schema)
	- [middlewares (with redis caching)](#middlewares-with-redis-caching)
	- [validators](#validators)
	- [routes (including validators)](#routes-including-validators)
	- [nodemailer](#nodemailer)
	- [p-limit](#p-limit)
	- [lodash](#lodash)
	- [axios](#axios)

## Description

When the program start a message will be shown:

```
> Trying to connect to DB
> Connected to DB
> App is listening...
> App Name: express-mongo-starter-kit
> Version: 1.0.0
> Port: 3000
```

If there is a problem in the database the following error message will be shown and the program will terminate:

```
> Trying to connect to DB
> Error connecting to DB
```

For testing the app is working properly, there is a `ping` middleware:

```
http://localhost:3000/api/ping
```

and get the following response:

```json
{
	"name": "gptalk-backend",
	"port": 3000,
	"version": "1.0.0"
}
```

on every request the program log it to a file and the console, using winston and winston-daily-rotate-file, for example:

```
[19:00:00] INFO: GET /api/ping 200 2ms
```

## Usage

Install dependencies:

```
npm install
```

To run in developer mode:

```
npm run dev
```

To build the project:

```
npm run build
```

To start the project after build:

```
npm start
```

## .env file

In the .env file you can add environment like the database url, port, jwt secret and more.

For example:

```
DB_URL=mongodb://127.0.0.1:27017/DB_NAME
REDIS_URL=redis://127.0.0.1:6379
HOSTNAME=localhost
PROTOCOL=http
PORT=3000
TTL=3600
```

## cross-env

Installation:

```
npm install cross-env
```

With cross-env you can add an environment variables across platforms.

Using cross-env to add environment variable to a specific command in the project:

```json
{
	"scripts": {
		"build": "cross-env NODE_ENV=production npm run build"
	}
}
```

## Unit Testing

Test the api using Jest.

Use the `Arrange-Act-Assert` method.

To install jest:

```
npm install --save-dev jest ts-jest @types/jest
```

Add a `jest.config.js` file in the root folder:

```javascript
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
};
```

To test the app use the command:

```
npm run test
```

To get a coverage report use the command:

```
npm run test:coverage
```

Create a folder named `__tests__` for all the tests.

Create a folder for each folder to test, for example: `controllers`, `middleware`, `config` and more.

Create a `.spec` file, for example: on `__tests__/controllers/` folder, `user.controller.spec.ts`:

```ts
import { Request, Response, NextFunction } from 'express';
import { addUserMiddleware } from '../../src/controllers/user.controller';
import { UserModel, Role } from '../../src/models/user.interface';
import { redisClient } from '../../src/config/cache';

jest.mock('../../src/models/user.interface');
jest.mock('../../src/config/cache');

describe('Middleware Tests', () => {
	let req: Request;
	let res: Response;
	let next: jest.Mock<NextFunction>;

	jest.mock;

	beforeEach(() => {
		req = {} as Request;
		res = {} as Response;
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const createdUser = {
		username: 'test',
		email: 'test@test.spec',
		age: 20,
		role: Role.USER,
	};

	describe('addUserMiddleware', () => {
		it('should create a user and return it', async () => {
			// Arrange
			req.body = {
				username: 'test',
				email: 'test@test.spec',
				age: 20,
				role: Role.USER,
			};

			const createMock = jest.fn().mockResolvedValue(createdUser);
			jest.spyOn(UserModel, 'create').mockImplementation(createMock);

			jest.spyOn(redisClient, 'setEx').mockResolvedValue('');

			// Act
			await addUserMiddleware(req as Request, res as Response, next);

			// Assert
			expect(UserModel.create).toHaveBeenCalledTimes(1);
			expect(UserModel.create).toHaveBeenCalledWith({
				username: 'test',
				email: 'test@test.spec',
				age: 20,
				role: Role.USER,
			});
		});
	});
});
```

## Swagger

Installation:

```
npm install swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

Swagger ui (on localhost, in prod switch to prod protcol, port and hostname):

```
http://localhost:3000/api/docs
```

Swagger Docs:

The docs written in `swagger.yaml` file in the `src` folder.

Add info to the `yaml` file:

```yaml
openapi: 3.0.3
info:
  title: Express & Mongo API Starter Kit
  description: Backend api starter kit using express, mongo and redis.
  contact:
    name: Oneill19
    email: oneill.p.19@gmail.com
    url: https://github.com/oneill19
  license:
    name: MIT
  version: 1.0.0
```

Add a tag to the `yaml` file:

```yaml
tags:
  - name: General
    description: general requests
  - name: Users
    description: user managment
```

Add a schema to the `yaml` file:

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - username
        - email
        - age
        - role
      properties:
        _id:
          type: string
        username:
          type: string
        email:
          type: string
        age:
          type: number
          format: int64
        role:
          type: string
          enum:
            - ADMIN
            - PRO
            - USER
```

Add a path to the `yaml` file:

```yaml
paths:
  /api/user:
    post:
      description: add a user to the database
      access: public
      tags:
        - Users
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          definition: user object
```

In `index.ts` add the following:

```ts
import YAML from 'yamljs';

// swagger
const swaggerDocument = YAML.load('src/swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

## Examples

### enum, interface and schema

```ts
import { Schema, model } from 'mongoose';

export enum Role {
	ADMIN = 'ADMIN',
	PRO = 'PRO',
	USER = 'USER',
}

export interface User {
	_id?: Schema.Types.ObjectId;
	username: string;
	email: string;
	age: number;
	role: Role;
}

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		role: {
			type: String,
			required: true,
			enum: Role,
		},
	},
	{
		timestamps: true,
	},
);

export const UserModel = model<User>('User', userSchema);
```

### middlewares (with redis caching)

```ts
import { Request, Response, NextFunction } from 'express';
import { Config } from '../config/config';
import { redisClient } from '../config/cache';
import { UserModel } from '../models/user.interface';

export async function addUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the values of the user from the request body
		const { username, email, age, role } = req.body;

		// create the user
		const user = new UserModel({
			username,
			email,
			age,
			role,
		});

		// save the user in the database
		const result = await user.save();

		// cache the user in the redis server
		await redisClient.setEx(`${result._id}`, Config.TTL, JSON.stringify(result));

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}

export async function getUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the mongo id from the request body
		const { id: _id } = req.params;

		// check if there is cached data
		const cachedResult = JSON.parse(await redisClient.get(_id));

		// if there is, return it
		if (cachedResult) {
			return res.send({ cachedResult });
		}

		// get the user from the database
		const result = await UserModel.findById({ _id });

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}

export async function editUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the data from the request body
		const { id: _id } = req.params;
		const { username, email, age, role } = req.body;

		// update the data
		const result = await UserModel.findByIdAndUpdate(
			{ _id },
			{ username, email, age, role },
			{ new: true },
		);

		// cache the user in the redis server
		await redisClient.setEx(`${result._id}`, Config.TTL, JSON.stringify(result));

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}

export async function deleteUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the mongo id from the request body
		const { id: _id } = req.params;

		// delete the user
		const result = await UserModel.findByIdAndDelete({ _id });

		// remove the user from redis
		await redisClient.del(_id);

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}
```

### validators

```
npm install express-validator
```

```ts
// validator.middlware.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export async function validator(req: Request, res: Response, next: NextFunction) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
}
```

```ts
// validator.pipe.ts

import { param, body } from 'express-validator';
import { Role } from '../models/user.interface';

export const validateMongoId = [param('id').exists().bail().isMongoId()];

export const validateUser = [
	body('username').exists().bail().isString().bail().notEmpty(),
	body('email').exists().bail().isEmail(),
	body('age').exists().bail().isInt({ min: 18 }),
	body('role').exists().bail().isIn(Object.values(Role)),
];
```

### routes (including validators)

```ts
import { Router } from 'express';
import {
	addUserMiddleware,
	deleteUserMiddleware,
	editUserMiddleware,
	getUserMiddleware,
} from '../controllers/user.controller';
import { validator } from '../middlewares/validator.middleware';
import { validateMongoId, validateUser } from '../pipes/validator.pipe';
const router = Router();

/**
 * @route POST /api/user/add
 * @description add a user to the database
 * @access public
 */
router.post('/add', validateUser, validator, addUserMiddleware);

/**
 * @route GET /api/user/get/:id
 * @description get a user from the database by the id
 * @access public
 */
router.get('/get/:id', validateMongoId, validator, getUserMiddleware);

/**
 * @route PATCH /api/user/edit/:id
 * @description edit a user in the database by the id
 * @access public
 */
router.patch('/edit/:id', validateMongoId, validateUser, validator, editUserMiddleware);

/**
 * @route DELETE /api/user/delete/:id
 * @description delete a user from the database
 * @access public
 */
router.delete('/delete/:id', validateMongoId, validator, deleteUserMiddleware);

export default router;
```

```ts
// add on index.ts

app.use('/api/user', userRouter);
```

### nodemailer

```
npm install nodemailer
npm install --save-dev @types/nodemailer
```

```ts
import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
async function main() {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: Config.EMAIL_USER, // email user from .env file
			pass: Config.EMAIL_PASSWORD, // password for email  from .env file
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Backend Developer" <foo@example.com>', // sender address
		to: 'devloper1@example.com, developer2@example.com', // list of receivers
		subject: 'Hello ✔', // Subject line
		text: 'Hello world?', // plain text body
		html: '<b>Hello world?</b>', // html body
	});
}
```

### p-limit

```
npm install p-limit
```

```ts
import pLimit from 'p-limit';
import { Request, Response, NextFunction } from 'express';

// concurrency limit
const limit = pLimit(1);

// middlware
export async function foo(req: Request, res: Response, next: NextFunction) {
	try {
		// code...

		const value = await limit(async () => {
			// critical code
		});

		// code...

		return res.send({ response: true });
	} catch (err) {
		next(err);
	}
}
```

### lodash

```
npm install lodash
npm install --save-dev @types/lodash
```

```ts
import _ from 'lodash';

_.flattenDeep([1, [2, [3, [4]], 5]]); // => [1, 2, 3, 4, 5]
```

### axios

```
npm install axios
```

```ts
import axios from 'axios';

export async function getData() {
	try {
		const response = await axios.get(Config.API_URL);
		return response;
	} catch (err) {
		throw new Error('error in getting data');
	}
}

export async function postData() {
	try {
		const response = await axios.post(Config.API_URL, {
			data,
		});
	} catch (err) {
		throw new Error('error in posting data');
	}
}
```
