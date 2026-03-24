FROM node:18

RUN apt-get update && apt-get install -y \
  poppler-utils \
  ghostscript \
  img2pdf \
  pdftk \
  qpdf \
  libreoffice \
  tesseract-ocr \
  tesseract-ocr-eng \
  wkhtmltopdf \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
