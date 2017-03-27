exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['../integrationTest.js'],
  capabilities: {
    browserName: 'chrome',
    'chromeOptions': { 'args': [
      'incognito',
      'use-fake-ui-for-media-stream'
    ]}
  },
  onPrepare: () => {
    global.dv = browser.driver;
    browser.resetUrl = 'file://';
    browser.ignoreSynchronization = true;
  }
};
