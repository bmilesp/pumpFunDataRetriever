# Use an official Node.js runtime as the base image
FROM ubuntu:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the script to the working directory
COPY fetch-replies.js .

# Create the output directory
RUN mkdir -p /usr/src/app/output

# Set the default command to run the script
CMD ["node", "fetch-replies.js"]