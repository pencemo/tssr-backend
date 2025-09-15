FROM node:20

# Install Chromium + required fonts & libraries
RUN apt-get update && \
    apt-get install -y chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*
    
# Set working directory
WORKDIR /app

# Copy package.json & install deps
COPY package*.json ./
RUN npm install

# Copy app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
