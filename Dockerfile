FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "run", "start:prod"] 