FROM wechaty/wechaty

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app

RUN npm install -g typescript
RUN npm install -g ts-node

COPY . .

RUN npm install
RUN npm i --save-dev @types/qrcode-terminal

CMD [ "npm", "rum", "demo"]