FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    ghostscript \
    imagemagick \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads outputs

EXPOSE 3000

CMD ["npm", "start"]
