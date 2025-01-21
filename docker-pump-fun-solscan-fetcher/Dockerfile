# Use an official Node.js runtime as the base image
FROM node:22.0.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the script to the working directory
COPY solscan-fetcher.js .

# Create the output directory
RUN mkdir -p /usr/src/app/output

# Set the default command to run the script
CMD ["node", "solscan-fetcher.js"]