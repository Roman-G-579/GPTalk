# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy app source code
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "start"]
