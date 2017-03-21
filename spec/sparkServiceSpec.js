const proxyquire = require('proxyquire');

describe('SparkService', () => {
  let mockSpark, mockCall, mockLocalMediaStream, SparkService, authenticationCallback, fakeListener = null;

  beforeEach(() => {
    mockCall = {
      hangup: jasmine.createSpy('hangup')
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
        dial: jasmine.createSpy('dial').and.returnValue(mockCall)
      },
      authorize: jasmine.createSpy('authorize'),
      config: {
        credentials: {
          oauth: {}
        }
      },
      isAuthenticated: true
    };

    spyOn(mockSpark, 'on').and.callThrough();

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

  describe('callUser', () => {
    const email = 'user@spark.com';
    const constraints = {
      audio: true,
      video: true,
      fake: false
    };

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
});
