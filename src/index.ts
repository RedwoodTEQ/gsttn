#!/usr/bin/env node

import axios from 'axios';
import * as https from 'https';

let appId: string = null;
let accessKey: string = null;
let API_HOST: string = 'localhost';
let API_PORT: number = 5000;

const axios_instance = axios.create({
  // baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

function ConnectToTtn(appId: string, accessKey: string, API_URL: string) {
  const ttn = require("ttn");
  ttn.data(appId, accessKey)
    .then((client: any) => {
      console.log('Successfully connected to TTN, waiting for events ...');

      // uplink data event
      client.on("uplink", (devID: any, payload: any) => {
        console.log("Received uplink from ", devID, " message:");
        console.log(payload);
        console.log("");

        axios_instance
          .post(API_URL, payload)
          .catch((err: any) => {
            // console.error(`Error on posting message: ${err.errno}, ${err.address}:${err.port}`);
            console.error(`Error on posting message: ${err}`);
          });

        // console.log("send downlink message");
        // send downlink
        // client.send(devID, new Buffer([0x0f, 0xaf]))
      });

      // all device events for all devices
      // client.on("event", (devID: any, message: any) => {
      //   console.log("Received event from ", devID);
      //   console.log("Message:");
      //   console.log(message);
      //   console.log("");
      // });

    }).catch((error: any) => {
      console.error("Error", error)
      process.exit(1)
    })
}

function isEmptyOrSpaces(str: string) {
  return str == null || str.match(/^ *$/) !== null;
}

function Main(argc: string[]) {
  var pjson = require('../package.json');
  console.log(`Launching gsttn ${pjson.version} ...`);

  if (argc.length > 0) {
    console.log(`argc.length = ${argc.length}, argc = ${argc}`);
  }

  if (argc.length == 2) {
    appId = argc[0];
    accessKey = argc[1];
    console.log(`appId = ${appId}; accessKey = ${accessKey}`);
  } else {
    appId = process.env.TTN_APP_ID;
    accessKey = process.env.TTN_ACCESS_KEY;
  }

  if (isEmptyOrSpaces(appId) || isEmptyOrSpaces(accessKey)) {
    console.error(`Invalid TTN appId (${appId}) or accessKey (${accessKey}), program terminated`);
    return;
  }
  else {
    console.error(`Connecting to TTN application ...`);
    let specifiedHost = process.env.API_HOST;
    if (specifiedHost) {
      API_HOST = specifiedHost;
    }

    let specifiedPort: number = +process.env.API_PORT;
    if (specifiedPort) {
      API_PORT = specifiedPort;
    }

    const API_URL = `http://${API_HOST}:${API_PORT}/textdata`;

    console.log('appId: ', appId);
    console.log('accessKey: ', accessKey);
    console.log('API_URL:', API_URL);

    ConnectToTtn(appId, accessKey, API_URL);
  }
}

Main(process.argv.splice(2))