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
