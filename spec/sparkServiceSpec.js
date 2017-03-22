const proxyquire = require('proxyquire');
const constraints = {
  audio: true,
  video: true,
  fake: false
};

describe('SparkService', () => {
  let mockSpark,
    mockCallback,
    mockCall,
    mockLocalMediaStream,
    SparkService,
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

    mockLocalMediaStream = 'BATMAN';

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
        createLocalMediaStream: jasmine.createSpy('createLocalMediaStream')
          .and.returnValue(Promise.resolve(mockLocalMediaStream)),
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

    SparkService = proxyquire('../js/sparkService', {
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
      SparkService.authorize();
      expect(mockSpark.authorize).toHaveBeenCalled();
    });

  });

  describe('register', () => {
    it('listens for Spark authentication changes', (done) => {
      SparkService.register();
      expect(mockSpark.on).toHaveBeenCalledWith('change:isAuthenticated', jasmine.any(Function));
      done();
    });

    it('stops listening for Spark authentication changes', (done) => {
      SparkService.register().then(() => {
        expect(mockSpark.off).toHaveBeenCalledWith('change:isAuthenticated', fakeListener);
        done();
      });
      authenticationCallback();
    });

    it('registers the device', (done) => {
      SparkService.register().then(() => {
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
        SparkService.register().then(() => {
          fail('Promise unexpectedly resolved');
        });
        authenticationCallback();
        done();
      });
    });
  });

  describe('listen', () => {
    it('registers a listener for call:incoming on the Spark Phone', () => {
      SparkService.listen();
      expect(mockSpark.phone.on).toHaveBeenCalledWith('call:incoming', jasmine.any(Function));
    });

    describe('when the call direction is out', () => {
      beforeEach(() => {
        mockCall.direction = 'out';
      });

      it('callback does not get executed', () => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall);
        expect(mockCallback).not.toHaveBeenCalled();
      });

      it('does not call Spark Call acknowledge', () => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall);
        expect(mockCall.acknowledge).not.toHaveBeenCalled();
      });
    });

    describe('when the call direction is in', () => {
      beforeEach(() => {
        mockCall.direction = 'in';
      });

      it('callback does get executed', () => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall);
        expect(mockCallback).toHaveBeenCalledWith(mockCall);
      });

      it('calls Spark Call acknowledge', () => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall);
        expect(mockCall.acknowledge).toHaveBeenCalled();
      });
    });
  });

  describe('answerCall', () => {
    it('callback does get executed', () => {
      SparkService.answerCall(mockCall, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(mockCall);
    });

    it('calls Spark Phone createLocalMediaStream', (done) => {
      SparkService.answerCall(mockCall, mockCallback);
      expect(mockSpark.phone.createLocalMediaStream).toHaveBeenCalledWith(constraints);
      done();
    });

    it('calls Spark Call answer', (done) => {
      SparkService.answerCall(mockCall, mockCallback).then(() => {
        expect(mockCall.answer).toHaveBeenCalledWith(Object.assign({}, constraints, { localMediaStream: mockLocalMediaStream }));
        done();
      });
    });
  });

  describe('rejectCall', () => {
    it('calls Spark Call reject', () => {
      SparkService.rejectCall(mockCall);
      expect(mockCall.reject).toHaveBeenCalled();
    });
  });

  describe('callUser', () => {
    const email = 'user@spark.com';

    it('calls createLocalMediaStream', (done) => {
      SparkService.callUser(email).then(() => {
        expect(mockSpark.phone.createLocalMediaStream).toHaveBeenCalledWith(constraints);
        done();
      });
    });

    it('calls dial', (done) => {
      SparkService.callUser(email).then(() => {
        expect(mockSpark.phone.dial).toHaveBeenCalledWith(email, Object.assign({}, constraints, mockLocalMediaStream));
        done();
      });
    });

    it('resolves with a call', (done) => {
      SparkService.callUser(email).then((call) => {
        expect(call).toEqual(mockCall);
        done();
      });
    });
  });

  describe('hangupCall', () => {
    it('calls Spark hangup', () => {
      SparkService.hangupCall(mockCall);
      expect(mockCall.hangup).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('calls Spark logout', () => {
      SparkService.logout();
      expect(mockSpark.logout).toHaveBeenCalledWith({ goto: window.location.protocol + '//' + window.location.host + '/' });
    });
  });

  describe('getAvatarUrl', () => {

    it('calls Spark list people', (done) => {
      const fakeEmail = 'I am your father';
      SparkService.getAvatarUrl(fakeEmail).then(() => {
        expect(mockSpark.people.list).toHaveBeenCalledWith({ email: fakeEmail });
        done();
      });
    });

    it('resolves with the avatar of the other person', (done) => {
      SparkService.getAvatarUrl('hey').then((avatar) => {
        expect(avatar).toEqual(fakePeople.items[0].avatar);
        done();
      });
    });

    describe('when there are no people in the call', () => {
      beforeEach(() => {
        fakePeople.items = [];
      });

      it('rejects', (done) => {
        SparkService.getAvatarUrl('hi').then(() => {
          fail('Promise unexpectedly resolved');
        }).catch(() => {
          done();
        });
      });
    });

    describe('when the first person doesn\'t have an avatar', () => {
      beforeEach(() => {
        fakePeople.items[0].avatar = null;
      });

      it('rejects', (done) => {
        SparkService.getAvatarUrl('hi').then(() => {
          fail('Promise unexpectedly resolved');
        }).catch(() => {
          done();
        });
      });
    });
  });
});
