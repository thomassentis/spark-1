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
    fakeListener = null;

  beforeEach(() => {
    mockCallback = jasmine.createSpy('mockCallback');

    mockCall = {
      hangup: jasmine.createSpy('hangup'),
      acknowledge: jasmine.createSpy('acknowledge'),
      answer: jasmine.createSpy('answer')
    };

    mockLocalMediaStream = 'BATMAN';

    fakeListener = 'BEES!?';

    mockSpark = {
      on: (event, callback) => {
        authenticationCallback = callback;
        return fakeListener;
      },
      off: jasmine.createSpy('off'),
      people: {
        list: () => {}
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

      it('does not call Spark Phone createLocalMediaStream', (done) => {
        SparkService.listen();
        incomingCallback(mockCall);
        expect(mockSpark.phone.createLocalMediaStream).not.toHaveBeenCalled();
        done();
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

      it('calls Spark Phone createLocalMediaStream', (done) => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall);
        expect(mockSpark.phone.createLocalMediaStream).toHaveBeenCalledWith(constraints);
        done();
      });

      it('calls Spark Call answer', (done) => {
        SparkService.listen(mockCallback);
        incomingCallback(mockCall).then(() => {
          expect(mockCall.answer).toHaveBeenCalledWith(Object.assign({}, constraints, { localMediaStream: mockLocalMediaStream }));
          done();
        });
      });
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
});
