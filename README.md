# spark-js-sdk-example

This demo app is designed to provide a clear understanding of the process of integrating Cisco's Spark JavaScript Source Developer Kit into your app for calling and receiving calls.

## General description

In creating this demo application, we decided not to use any frameworks in attempts to not obfuscate the details of the actual integration process for the SDK. The application is built with npm & browserify. Each html page within the app has an associated javascript file to handle all of its logic. Shared code for interacting directly with the Spark SDK is located within the sparkService.js file. We also maintain a collection of tests corresponding to our service logic and UI functionality.

## How to Host the App

* [Install NodeJS](https://nodejs.org/en/download/)

* Clone the repo: `$ git clone https://github.com/ciscospark/spark-js-sdk-example.git`

* `$ cd spark-js-sdk-example`

* `$ npm install`

* To launch the example app, you'll need Spark Integration credentials. These can be obtained by logging into Spark and following [this guide](https://developer.ciscospark.com/authentication.html). Within the example app, four fields should be included in a JSON file named '.env.json' in the root directory: CISCOSPARK_CLIENT_ID, CISCOSPARK_CLIENT_SECRET, CISCOSPARK_SCOPE, and CISCOSPARK_REDIRECT_URI, all taken from your integration. The redirect URI should be `http://localhost:8000/index.html`.

* `$ npm install -g browserify && npm install -g node-sass`

* `$ npm start`

* In your browser of choice, go to `http://localhost:8000` (Note: Internet Explorer is not supported)

## How to Run the Tests

* `$ npm install -g jasmine`

* From within the app's root directory:

* `$ npm test`

## Supported Browsers

* The app is intended for Google Chrome or Mozilla Firefox. Internet Explorer is not supported by the Spark SDK.
