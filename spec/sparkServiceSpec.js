const proxyquire = require('proxyquire');

describe('SparkService', () => {
  let mockSpark, mockCall, mockLocalMediaStream, SparkService, authenticationCallback, fakeListener = null;

  beforeEach(() => {
    mockCall = {
      on: jasmine.createSpy('call.on'),
      hangup: jasmine.createSpy('hangup')
    };

    mockLocalMediaStream = {};

    fakeListener = 'TWICE';

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
        register: jasmine.createSpy('register'),
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
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValues(false, true)
    };

    spyOn(mockSpark, 'on').and.callThrough();

    SparkService = proxyquire('../js/sparkService', {
      'ciscospark': mockSpark,
      'jquery': () => {
        return {
          attr: () => {}
        };
    }});
  });

  describe('authorize', () => {

    it('calls Spark authorize', () => {
      SparkService.authorize();
      expect(mockSpark.authorize).toHaveBeenCalled();
    });

  });

  describe('waitForAuthorization', () => {
    it('registers listener for Spark authentication changes', (done) => {
      SparkService.waitForAuthentication();
      expect(mockSpark.on).toHaveBeenCalledWith('change:isAuthenticated', jasmine.any(Function));
      done();
    });

    it('removes the listener for Spark authentication changes and completes', (done) => {
      SparkService.waitForAuthentication().then(() => {
        expect(mockSpark.off).toHaveBeenCalledWith('change:isAuthenticated', fakeListener);
        done();
      });
      authenticationCallback();
    });

    it('does not complete', (done) => {
      SparkService.waitForAuthentication().then(() => {
        fail('Promise unexpectedly resolved');
      });
      mockSpark.isAuthenticated = false;
      authenticationCallback();
      done();
    });
  });

  describe('register', () => {
    it('calls spark register', () => {
      SparkService.register();
      expect(mockSpark.phone.register).toHaveBeenCalled();
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

    it('registers listener for call connected and localMediaStream:change events', (done) => {
      SparkService.callUser(email).then(() => {
        expect(mockCall.on).toHaveBeenCalledWith('connected', jasmine.any(Function));
        expect(mockCall.on).toHaveBeenCalledWith('localMediaStream:change', jasmine.any(Function));
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
