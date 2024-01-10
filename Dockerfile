FROM node

RUN npm install http-server -g

# Create app directory
WORKDIR /usr/src/app

CMD http-server -o .