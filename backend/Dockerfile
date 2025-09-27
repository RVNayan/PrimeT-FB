# Use Node.js official image
FROM node:20

# Create working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Run backend
CMD ["npm", "run", "dev"]
