exports.config = {
  seleniumServerJar: 'selenium-server-standalone-3.0.1.jar',
  specs: ['../integrationTest.js'],
  capabilities: {
    browserName: 'chrome',
    'chromeOptions': { 'args': [
      'incognito',
      'use-fake-ui-for-media-stream'
    ]}
  },
  frameworks: ['jasmine'],
  onPrepare: () => {
    global.dv = browser.driver;
    browser.resetUrl = 'file://';
    browser.ignoreSynchronization = true;
  }
};
