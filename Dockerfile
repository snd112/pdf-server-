FROM node:18-bullseye

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    ghostscript \
    qpdf \
    pdftk \
    imagemagick \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ara \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/rights="none"/rights="read|write"/g' /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads outputs
RUN chmod -R 777 uploads outputs

EXPOSE 3000

CMD ["node","server.js"]
