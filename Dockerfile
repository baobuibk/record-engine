FROM node:lts
WORKDIR /home/node/app
COPY package.json .
RUN npm install
COPY src ./src
EXPOSE 8001
CMD ["node", "src/index.js"]
