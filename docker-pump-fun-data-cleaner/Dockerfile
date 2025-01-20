# Use an official Node.js runtime as the base image
FROM node:22.0.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the script to the working directory
COPY data-cleaner.js .

# Set the default command to run the script
CMD ["node", "data-cleaner"]