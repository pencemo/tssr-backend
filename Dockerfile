FROM node:20

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    gnupg \
    xdg-utils \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libglib2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    fonts-dejavu-core \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install chromium from Debian repo (usually chromium is available)
RUN apt-get update && apt-get install -y chromium --no-install-recommends || true

# If above didn't install chromium executable, fallback to installing chromium-browser
RUN if [ ! -f /usr/bin/chromium ] && [ ! -f /usr/bin/chromium-browser ]; then \
      apt-get update && apt-get install -y chromium-browser --no-install-recommends || true; \
    fi && rm -rf /var/lib/apt/lists/*
    
# Set working directory
WORKDIR /app

# Copy package.json & install deps
COPY package*.json ./
RUN npm ci --production
RUN npm install

# Copy app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
