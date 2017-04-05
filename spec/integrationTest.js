const env = require('../.env.json');
const until = protractor.until;
const EC = protractor.ExpectedConditions;
const waitTimeout = 5000;
const sparkUrl = 'localhost:8000';

describe('Search for a user', () => {

  beforeAll(() => {
    browser.get(sparkUrl);
    login(env.calleeUsername, env.calleePassword);
    dv.sleep(1000);
    logout();
    login(env.sparkUsername, env.sparkPassword)
  });

  afterAll(() => {
    logout();
  });

  it('should return an error if the user is not found', () => {

    callUserByEmail(env.fakeUser);
    waitForTextToBePresentInElementByID('calling-status', 'Fail');
    expect(EC.presenceOf(element(By.id('calling-status'))));
    hangup('hangup-calling');

  });

  it('should succeed in calling a valid user', () => {

    callUserByEmail(env.calleeUsername);
    waitForElementByIDToBeVisible('hangup-calling');
    hangup('hangup-calling');

  });

  describe('when logged in', () => {

    it('should answer an incoming audio-video call', () => {

      let incomingBrowser = browser.forkNewDriverInstance();
      incomingBrowser.ignoreSynchronization = true;
      incomingBrowser.get(sparkUrl);

      incomingBrowser.element(By.id('login-button')).click();
      incomingBrowser.element(By.id('IDToken1')).sendKeys(env.calleeUsername);
      incomingBrowser.element(By.id('IDButton2')).click();

      dv.sleep(1000);
      incomingBrowser.element(By.id('IDToken2')).sendKeys(env.calleePassword);
      incomingBrowser.element(By.id('Button1')).click();

      dv.sleep(3000);
      incomingBrowser.element(By.id('user-email')).sendKeys(env.sparkUsername);
      dv.sleep(500);
      incomingBrowser.element(By.id('call-audio-video')).click();

      dv.sleep(3000);
      clickButtonByIdOnceClickable('answer-audio-video');

    });

    it('should be able to toggle incoming video', () => {
      clickButtonByIdOnceClickable('toggle-incoming-video');
      waitForElementByIDToBeVisible('incoming-call-video-overlay');
      clickButtonByIdOnceClickable('toggle-incoming-video');
      waitForElementByIDToBeInvisible('incoming-call-video-overlay');
    });

    it('should be able to toggle outgoing video', () => {
      clickButtonByIdOnceClickable('toggle-outgoing-video');
      waitForElementByIDToBeVisible('outgoing-call-video-overlay');
      clickButtonByIdOnceClickable('toggle-outgoing-video');
      waitForElementByIDToBeInvisible('outgoing-call-video-overlay');
    });

    it('should be able to toggle outgoing audio', () => {
      clickButtonByIdOnceClickable('toggle-outgoing-audio');
      expect(hasClass(element(By.id('toggle-outgoing-audio')), 'off')).toBe(true);
      clickButtonByIdOnceClickable('toggle-outgoing-audio');
      expect(hasClass(element(By.id('toggle-outgoing-audio')), 'off')).toBe(false);
      hangup('hangup-call');
    });
  });
});

function login(username, password) {

  clickButtonByIdOnceClickable('login-button');
  sendKeysToElementByIdWhenReady('IDToken1', username);
  clickButtonByIdOnceClickable('IDButton2');
  sendKeysToElementByIdWhenReady('IDToken2', password);
  clickButtonByIdOnceClickable('Button1');

  browser.getCurrentUrl().then((url) => {
    if (url !== "http://localhost:8000/index.html") {
      clickButtonByNameOnceClickable('accept');
    }
  });

}

function clickButtonByIdOnceClickable(buttonID) {
  clickButtonOnceClickable(element(By.id(buttonID)));
}

function sendKeysToElementByIdWhenReady(id, keys) {
  waitForElementByIDToBeVisible(id);
  element(By.id(id)).clear().sendKeys(keys);
}

function clickButtonByNameOnceClickable(name) {
  clickButtonOnceClickable(element(By.name(name)));
}

function clickButtonOnceClickable(button) {
  waitForElementToBeClickable(button);
  button.click();
}

function logout() {
  clickButtonByIdOnceClickable('logout-button');
}

function hangup(id) {
  clickButtonByIdOnceClickable(id);
}

function callUserByEmail(email) {

  expectStalenessOfElementByID('spark-message');
  sendKeysToElementByIdWhenReady('user-email', email);
  clickButtonByIdOnceClickable('call-audio-video');

}

function expectStalenessOfElementByID(id) {
  expect(EC.stalenessOf(element(By.id(id))));
}

function waitForElementByIDToBeClickable(id) {
  waitForElementToBeClickable(element(By.id(id)));
}

function waitForElementToBeClickable(htmlElement) {
  browser.wait(EC.elementToBeClickable(htmlElement), waitTimeout);
}

function waitForElementByIDToBeVisible(id) {
  browser.wait(EC.visibilityOf(element(By.id(id))), waitTimeout);
}

function waitForElementByIDToBeInvisible(id) {
  browser.wait(EC.invisibilityOf(element(By.id(id))), waitTimeout);
}

function waitForTextToBePresentInElementByID(id, text) {
  waitForElementByIDToBeVisible(id);
  browser.wait(EC.textToBePresentInElement(element(By.id(id)), text), waitTimeout);
}

function toggleAllCapabilities() {

  it('should be able to toggle incoming video', () => {
    //waitForElementByIDToBeVisible('toggle-incoming-video');
    clickButtonByIdOnceClickable('toggle-incoming-video');
    waitForElementByIDToBeVisible('incoming-call-video-overlay');
  });

  xit('should be able to toggle incoming audio', () => {
    clickButtonByIdOnceClickable('toggle-incoming-audio');
    //waitForElementByIDToBeVisible('incoming-call-video-overlay');
  });

  xit('should be able to toggle outgoing video', () => {
    clickButtonByIdOnceClickable('toggle-outgoing-video');
    waitForElementByIDToBeVisible('outgoing-call-video-overlay');
  });

  xit('should be able to toggle outgoing audio', () => {
    clickButtonByIdOnceClickable('toggle-outgoing-audio');
    expect(hasClass(element(By.id('toggle-outgoing-audio')), 'off')).toBe(false);
  });

}

var hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};
