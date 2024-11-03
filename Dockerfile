FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Set a default value for NODE_ENV if not provided
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies based on NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; then \
        npm install; \
    else \
        npm install --only=production; \
    fi

# Copy the rest of the application code
COPY . ./

# Install TypeScript globally (optional, can also be done locally)
# RUN npm run build

# Set the port for the application
ENV PORT 5000
EXPOSE $PORT

# Start the application
CMD ["node", "build/src/index.js"] # Adjust if your output path differs
