#!/usr/bin/env bash

function test() {
  webdriver-manager update
  nohup npm start &
  nohup webdriver-manager start &

  while ! nc -z localhost 8000; do
    sleep 0.1
  done

  protractor spec/support/conf.js

  nodeServerPID=$(ps S | tail -10 | cut -c1-5 | head -n 1)
  webdriverPID1=$(ps S | tail -11 | cut -c1-5 | head -n 1)
  webdriverPID3=$(ps S | tail -9 | cut -c1-5 | head -n 1)
  chromePID1=$(ps S | tail -8 | cut -c1-5 | head -n 1)

  kill $nodeServerPID
  kill $webdriverPID1
  kill $webdriverPID3
  kill $chromePID1

  rm nohup.out
  rm npm-debug.log

}


test

# until test && $protractorResult; do :; done
