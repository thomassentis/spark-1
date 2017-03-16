#!/bin/bash

watchify src/js/index.js -o src/js/bundle.js &
watchify src/js/loginController -o src/js/loginBundle.js &

node server.js
