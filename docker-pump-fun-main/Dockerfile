# Use the official Node.js image
FROM mcr.microsoft.com/playwright:focal

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright dependencies
RUN npx playwright install

# Copy the script
COPY main.js .

# Define environment variables for AWS S3
#ENV S3_BUCKET_NAME=your-bucket-name

# Command to run the script
CMD ["node", "main.js"]