FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install a simple HTTP server to serve the built app
RUN npm install -g serve

# Expose port
EXPOSE 3001

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "3001"]
