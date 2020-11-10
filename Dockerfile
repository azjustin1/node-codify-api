FROM node:8
WORKDIR /app
COPY package.json /app
RUN yarn install --ignore-engines
COPY . /app
EXPOSE 8081
CMD node -r esm server.js