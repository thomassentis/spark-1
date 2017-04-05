#!/usr/bin/env bash

function test() {

  echo "Spinning up local servers"
  nohup npm start &>/dev/null &
  nohup webdriver-manager start &>/dev/null &

  while ! nc -z localhost 8000; do
    sleep 0.1
  done

  protractorResult=$(protractor spec/support/conf.js)

  nodeServerPID=$(ps S | tail -10 | cut -c1-5 | head -n 1)
  webdriverPID1=$(ps S | tail -11 | cut -c1-5 | head -n 1)
  webdriverPID3=$(ps S | tail -9 | cut -c1-5 | head -n 1)
  chromePID1=$(ps S | tail -8 | cut -c1-5 | head -n 1)

  kill $nodeServerPID
  kill $webdriverPID1
  kill $webdriverPID3
  kill $chromePID1

  echo $protractorResult | grep -q "0 failures"
  if [ $? -eq 0 ]; then
    result=0
  else
    echo "Failed on attempt "$n" of 3"
  fi

}

n=0
result=1
until [ "$n" -gt 2 -o "$result" -eq 0 ]
do
  n=$[$n+1]
  test
done

if [ "$result" -eq 0 ]; then
  echo "Tests passed after "$n" attempt(s)"
  exit 0
else
  echo "Tests still failing after "$n" attempt(s)"
  exit 1
fi
