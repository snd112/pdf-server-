FROM node:18

RUN apt-get update && apt-get install -y libreoffice poppler-utils ghostscript

WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"]
