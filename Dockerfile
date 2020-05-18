FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk add --no-cache git
RUN npm install --production --silent && mv node_modules ../
COPY . .

CMD npm start