FROM node:20

# Install Chromium + required fonts & libraries
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    
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
