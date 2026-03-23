FROM node:18

RUN apt-get update && apt-get install -y \
  libreoffice \
  ghostscript \
  qpdf \
  poppler-utils \
  imagemagick \
  tesseract-ocr

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
