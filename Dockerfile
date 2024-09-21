FROM node:18

WORKDIR /app

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

COPY . ./

ENV PORT 7000
EXPOSE $PORT

CMD ["node", "index.js"]