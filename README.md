# Spark JavaScript SDK Example

This demo app is designed to provide a clear understanding of the process of integrating Cisco's Spark JavaScript Source Developer Kit into your app for calling and receiving calls.

## Lack of Frameworks/Libraries

We decided not to use any major JS frameworks/libraries such as React or Angular so that the example is clear to all JavaScript developers.

## Architecture

Each html page within the app has an associated javascript file to handle business logic. Shared code for interacting directly with the Spark SDK is located within the sparkService.js file. We also maintain a collection of tests corresponding to our service logic and UI functionality found in the test folder.

## How to Host the App

* [Install NodeJS](https://nodejs.org/en/download/)
* Clone the repo: `$ git clone https://github.com/ciscospark/spark-js-sdk-example.git`
* `$ cd spark-js-sdk-example`
* `$ npm install`
* To launch the example app, you'll need Spark Integration credentials. These can be obtained by logging into Spark and following [this guide](https://developer.ciscospark.com/authentication.html).
    - Under Scope, enable spark:people_read, spark:rooms_read, spark:rooms_write, spark:memberships_read, spark:memberships_write, spark:messages_read, spark:messages_write, spark:teams_read, and spark:teams_write
    - Under Redirect_URI, enter "http://localhost:8000/index.html"
    - Place the following in a new file named ".env.json" in the root directory of the project:

``` .env.json
{
  "CISCOSPARK_CLIENT_ID": "insert client id from Spark in these quotes",
  "CISCOSPARK_CLIENT_SECRET": "insert client secret from Spark in these quotes",
  "CISCOSPARK_SCOPE": "spark:people_read spark:rooms_read spark:rooms_write spark:memberships_read spark:memberships_write spark:messages_read spark:messages_write spark:teams_read spark:teams_write"
  "CISCOSPARK_REDIRECT_URI": "http://localhost:8000/index.html"
```
* `$ npm install -g browserify node-sass`
* `$ npm start`
* In your browser of choice, go to `http://localhost:8000` (Note: Internet Explorer is not supported)

## How to Run the Tests

* `$ npm install -g jasmine`
* From within the app's root directory:
* `$ npm test`

## Supported Browsers

* The app is intended for Google Chrome or Mozilla Firefox. Internet Explorer is not supported by the Spark SDK.

<!---
## TODO

* Link to live app
* Put more comments in the code
* Details on how to use the SDK
---!>
