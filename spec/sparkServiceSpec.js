const proxyquire = require('proxyquire').noCallThru();
const constraints = {
  audio: true,
  video: true,
  fake: false
};
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

describe('sparkService', () => {
  let mockSpark,
    mockCallback,
    mockCall,
    sparkService,
    authenticationCallback,
    incomingCallback,
    fakeListener,
    fakePeople;

  beforeEach(() => {
    mockCallback = jasmine.createSpy('mockCallback');

    mockCall = {
      hangup: jasmine.createSpy('hangup'),
      acknowledge: jasmine.createSpy('acknowledge'),
      answer: jasmine.createSpy('answer'),
      reject: jasmine.createSpy('reject')
    };

    fakeListener = 'BEES!?';

    fakePeople = {
      items: [
        { avatar: 'PANDORA' }
      ]
    };

    mockSpark = {
      on: (event, callback) => {
        authenticationCallback = callback;
        return fakeListener;
      },
      off: jasmine.createSpy('off'),
      people: {
        list: jasmine.createSpy('listPeople').and.returnValue(Promise.resolve(fakePeople))
      },
      phone: {
        register: jasmine.createSpy('register').and.returnValue(Promise.resolve()),
        dial: jasmine.createSpy('dial').and.returnValue(mockCall),
        on: (event, callback) => {
          incomingCallback = callback;
          return fakeListener;
        }
      },
      authorize: jasmine.createSpy('authorize'),
      config: {
        credentials: {
          oauth: {}
        }
      },
      isAuthenticated: true,
      logout: jasmine.createSpy('logout')
    };

    window = {
      location: {
        protocol: '3P0',
        host: 'C'
      }
    };

    spyOn(mockSpark, 'on').and.callThrough();
    spyOn(mockSpark.phone, 'on').and.callThrough();

    sparkService = proxyquire('../js/sparkService', {
      'ciscospark': mockSpark,
      'jquery': () => {
        return {
          attr: () => {}
        };
      }
    });
  });

  describe('authorize', () => {

    it('calls Spark authorize', () => {
      sparkService.authorize();
      expect(mockSpark.authorize).toHaveBeenCalled();
    });

  });

  describe('register', () => {
    it('listens for Spark authentication changes', (done) => {
      sparkService.register();
      expect(mockSpark.on).toHaveBeenCalledWith('change:isAuthenticated', jasmine.any(Function));
      done();
    });

    it('stops listening for Spark authentication changes', (done) => {
      sparkService.register().then(() => {
        expect(mockSpark.off).toHaveBeenCalledWith('change:isAuthenticated', authenticationCallback);
        done();
      });
      authenticationCallback();
    });

    it('registers the device', (done) => {
      sparkService.register().then(() => {
        expect(mockSpark.phone.register).toHaveBeenCalled();
        done();
      });
      authenticationCallback();
    });

    describe('when not authenticated', () => {
      beforeEach(() => {
        mockSpark.isAuthenticated = false;
      });

      it('does not complete', (done) => {
        sparkService.register().then(() => {
          fail('Promise unexpectedly resolved');
        });
        authenticationCallback();
        done();
      });
    });
  });

  describe('listenForCall', () => {
    it('registers a listener for call:incoming on the Spark Phone', () => {
      sparkService.listenForCall();
      expect(mockSpark.phone.on).toHaveBeenCalledWith('call:incoming', jasmine.any(Function));
    });

    describe('when the call direction is out', () => {
      beforeEach(() => {
        mockCall.direction = 'out';
      });

      it('callback does not get executed', () => {
        sparkService.listenForCall(mockCallback);
        incomingCallback(mockCall);
        expect(mockCallback).not.toHaveBeenCalled();
      });

      it('does not call Spark Call acknowledge', () => {
        sparkService.listenForCall(mockCallback);
        incomingCallback(mockCall);
        expect(mockCall.acknowledge).not.toHaveBeenCalled();
      });
    });

    describe('when the call direction is in', () => {
      beforeEach(() => {
        mockCall.direction = 'in';
      });

      it('callback does get executed', () => {
        sparkService.listenForCall(mockCallback);
        incomingCallback(mockCall);
        expect(mockCallback).toHaveBeenCalledWith(mockCall);
      });

      it('calls Spark Call acknowledge', () => {
        sparkService.listenForCall(mockCallback);
        incomingCallback(mockCall);
        expect(mockCall.acknowledge).toHaveBeenCalled();
      });
    });
  });

  describe('answerCall', () => {

    it('calls Spark Call answer', () => {
      sparkService.answerCall(mockCall);
      expect(mockCall.answer).toHaveBeenCalledWith({
        offerOptions: offerOptions,
        constraints: constraints
      });
    });
  });

  describe('callUser', () => {
    const user = 'Your Father';

    it('calls dial', () => {
      sparkService.callUser(user);
      expect(mockSpark.phone.dial).toHaveBeenCalledWith(user, {
        offerOptions: offerOptions,
        constraints: constraints
      });
    });

    it('returns a call', () => {
      expect(sparkService.callUser(user)).toEqual(mockCall);
    });

    describe('when passed video=false', () => {
      let options;

      beforeEach(() => {
        options = { video: false };
      });

      it('doesn\'t send or offer to receive video', () => {
        sparkService.callUser(user, options);
        expect(mockSpark.phone.dial).toHaveBeenCalledWith(user, {
          offerOptions: offerOptions,
          constraints: Object.assign({}, constraints, options)
        });
      });
    });
  });

  describe('logout', () => {
    it('calls Spark logout when authenticated', () => {
      sparkService.logout();
      expect(mockSpark.logout).toHaveBeenCalledWith({ goto: window.location.protocol + '//' + window.location.host + '/' });
    });

    it('does not call Spark logout when not authenticated', () => {
      mockSpark.isAuthenticated = false;
      sparkService.logout();
      expect(mockSpark.logout).not.toHaveBeenCalled();
    });
  });

  describe('getAvatarUrl', () => {
    it('calls Spark list people', (done) => {
      const fakeEmail = 'I am your father';
      sparkService.getAvatarUrl(fakeEmail).then(() => {
        expect(mockSpark.people.list).toHaveBeenCalledWith({ email: fakeEmail });
        done();
      });
    });

    it('resolves with the avatar of the other person', (done) => {
      sparkService.getAvatarUrl('hey').then((avatar) => {
        expect(avatar).toEqual(fakePeople.items[0].avatar);
        done();
      });
    });
  });
});
