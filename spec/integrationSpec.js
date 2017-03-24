const env = require('../.env.json');
const until = protractor.until;
const EC = protractor.ExpectedConditions;
const waitTimeout = 5000;
const sparkUrl = 'localhost:8000';

describe('Search for an user', () => {

  beforeAll(() => {
    browser.get(sparkUrl);
    login();
  });

  afterAll(() => {
    logout();
  });

  it('should return an error if the user is not found', () => {

    callUserByEmail(env.fakeUser);
    expectTextToEventuallyBePresentInElementByID('calling-status', 'Call Failed');
    hangup();

  });

  it('should succeed in calling a valid user', () => {

    callUserByEmail(env.calleeUsername);
    waitForElementByIDToBeVisible('hangup-calling');
    hangup();

  });
});

function login() {

  clickButtonByIdOnceClickable('login-button');
  sendKeysToElementByIdWhenReady('IDToken1', env.sparkUsername);

  clickButtonByIdOnceClickable('IDButton2');
  sendKeysToElementByIdWhenReady('IDToken2', env.sparkPassword);

  clickButtonByIdOnceClickable('Button1');
  clickButtonByNameOnceClickable('accept');

}

function clickButtonByIdOnceClickable(buttonID) {
  let button = element(By.id(buttonID));
  waitForElementToBeClickable(button);
  button.click();
}

function sendKeysToElementByIdWhenReady(id, keys) {
  waitForElementByIDToBeVisible(id);
  element(By.id(id)).clear().sendKeys(keys);
}

function clickButtonByNameOnceClickable(buttonName) {
  let button = element(By.name(buttonName));
  waitForElementToBeClickable(button);
  button.click();
}

function logout() {
  clickButtonByIdOnceClickable('logout-button');
}

function hangup() {
  clickButtonByIdOnceClickable('hangup-calling');
}

function callUserByEmail(email) {

  expectStalenessOfElementByID('spark-message');
  waitForElementByIDToBeClickable('logout-button');
  sendKeysToElementByIdWhenReady('user-email', email);
  clickButtonByIdOnceClickable('submit-user-email');

}

function expectStalenessOfElementByID(id) {
  expect(EC.stalenessOf(element(By.id(id))));
}

function waitForElementByIDToBeClickable(id) {
  browser.wait(EC.elementToBeClickable(element(By.id(id))), waitTimeout);
}

function waitForElementToBeClickable(htmlElement) {
  browser.wait(EC.elementToBeClickable(htmlElement), waitTimeout);
}

function waitForElementByIDToBeVisible(id) {
  browser.wait(EC.visibilityOf(element(By.id(id))), waitTimeout);
}

function expectTextToEventuallyBePresentInElementByID(id, text) {
  waitForElementByIDToBeVisible(id);
  expect(EC.textToBePresentInElement(element(By.id(id))));
}

function waitForElementById(id, waiter) {
  browser.wait(waiter(element(By.id(id))), waitTimeout);
}
