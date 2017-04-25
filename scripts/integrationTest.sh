#!/usr/bin/env bash

function test() {

  echo "Spinning up local servers"
  nohup npm start &>/dev/null &
  nohup $(npm bin)/webdriver-manager start &>/dev/null &

  while ! nc -z localhost 8000; do
    sleep 0.1
  done

  protractorResult=$($(npm bin)/protractor spec/support/conf.js)

  nodeServerPID=$(ps -ef | grep 'node server.js' | grep -v 'grep' | grep -v 'npm run build' | awk '{print $2}')
  webdriverPID1=$(ps -ef | grep 'webdriver-manager/selenium' | grep -v 'grep' | head -n 1 | awk '{print $2}')
  webdriverPID2=$(ps -ef | grep 'webdriver-manager/selenium' | grep -v 'grep' | tail -n 1 | awk '{print $2}')
  chromePID=$(ps -Sf | grep 'Google Chrome' | grep -v 'grep' | grep -v 'Helper' | head -n 1 | awk '{print $2}')

  kill $nodeServerPID
  kill $webdriverPID1
  kill $webdriverPID2
  kill $chromePID

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
