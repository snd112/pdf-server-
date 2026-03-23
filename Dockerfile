FROM node:18

RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    ghostscript \
    imagemagick \
    qpdf \
    && apt-get clean

RUN sed -i 's/rights="none"/rights="read|write"/g' /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads outputs

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
