# Spark JavaScript SDK Example
* [Purpose](#purpose)
* [Design Decisions](#design)
  * [Lack of Frameworks/Libraries](#frameworks)
  * [Architechture](#architecture)
* [Installation and Usage](#installation-and-usage)
  * [How to Host the App](#hosting)
  * [How to Use the App](#usage)
  * [How to Run Tests](#tests)
  * [Supported Browsers](#browsers)

<a name="purpose"></a>
## Purpose
This demo app is designed to provide a clear understanding of the process of integrating Cisco's Spark JavaScript Source Developer Kit into your app for calling and receiving calls.

<a name="design"></a>
## Design Decisions

<a name="frameworks"></a>
### Lack of Frameworks/Libraries

We decided not to use any major JS frameworks/libraries such as React or Angular so that the example is clear to all JavaScript developers.

<a name="architecture"></a>
### Architecture

Each html page within the app has an associated javascript file to handle business logic. Shared code for interacting directly with the Spark SDK is located within the sparkService.js file. We also maintain a collection of tests corresponding to our service logic and UI functionality found in the test folder.

<a name="installation-and-usage"></a>
## Installation and Usage

<a name="hosting"></a>
### How to Host the App

* [Install NodeJS](https://nodejs.org/en/download/)
* Clone the repo: `$ git clone https://github.com/ciscospark/spark-js-sdk-example.git`
* `$ cd spark-js-sdk-example`
* `$ npm install`
* To launch the example app, you'll need Spark Integration credentials. These can be obtained by [creating a Spark account](https://web.ciscospark.com/signin) and following [this guide](https://developer.ciscospark.com/authentication.html).
    - Under Scope, enable spark:people_read
    - Under Redirect_URI, enter "http://localhost:8000/index.html"
    - Place the following in a new file named ".env.json" in the root directory of the project:

``` .env.json
{
  "CISCOSPARK_CLIENT_ID": "insert client id from Spark in these quotes",
  "CISCOSPARK_CLIENT_SECRET": "insert client secret from Spark in these quotes",
}
```
* You can also override the following environment variables by adding them to the .env.json file:
    - CISCOSPARK_SCOPE
    - CISCOSPARK_REDIRECT_URI (needs to be changed if hosting anywhere aside from localhost:8000)
    - CISCOSPARK_LOG_LEVEL (defaults to 'info'. Alternative log levels are: silent, error, warn, log, info, debug, and trace)
* `$ npm install -g browserify node-sass`
* `$ npm start`
* In your browser of choice, go to `http://localhost:8000` (Note: Internet Explorer is not supported)

<a name="usage"></a>
### How to Use the App

* You must have a [Spark account](https://web.ciscospark.com/signin) to use the app
* On the login screen, click the login button. This forwards you to Spark's login page if you aren't already authenticated. If you've logged in already, skip the next two steps.
* Enter your Spark email address and click 'Next'
* Enter your password for Spark and click 'Sign In'. You will then be redirected to the app.
* Type an existing Spark user's email address (not your own!) and click one of the call buttons.
* Once a call is active, you can toggle your outgoing audio & video with the buttons below your video feed
* You can then hangup with the hangup button.
* If you receive an incoming call at any time (even when in an existing call), an overlay will be presented
    - Click one of the blue buttons to accept it with video or video and audio, or the red reject button to reject it.
* At any time, click the "sign out" button to log out of the app.

<a name="tests"></a>
### How to Run the Tests

* `$ npm install -g jasmine`
* From within the app's root directory:
* `$ npm test`

<a name="browsers"></a>
### Supported Browsers

* The app is intended for Google Chrome or Mozilla Firefox. Internet Explorer is not supported by the Spark SDK.
* **Chrome**: Optional - When developing without a webcam, start Chrome with the ```--use-fake-device-for-media-stream``` and ```--use-fake-ui-for-media-stream``` flags to simulate a webcam.

* **Firefox**: Required - If the app is not secured with SSL, microphone and camera permissions will be denied. This can be overriden by changing the ```media.navigator.permission.disabled``` flag to true within the ```about:config``` of Firefox.

### Useful snippets

* Log all events on a call: `call.on('all', (name) => console.log('currentCall event: ', name));`

<!---
## TODO

* Link to live app
* Put more comments in the code
* Details on how to use the SDK
* Do we support Edge?
* Consider tooltips within the app
---!>
