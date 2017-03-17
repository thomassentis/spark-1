const proxyquire = require('proxyquire');

describe('SparkService', () => {
  let mockSpark, mockCall, mockLocalMediaStream, SparkService, authenticationCallback, fakeListener = null;

  beforeEach(() => {
    process.env = {
      CISCOSPARK_CLIENT_ID: 'PHIL',
      CISCOSPARK_CLIENT_SECRET: 'WILL',
      CISCOSPARK_SCOPE: 'BREAK',
      CISCOSPARK_REDIRECT_URI: 'YOU!'
    };

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
    it('sets Spark OAuth credentials', () => {
      SparkService.authorize();
      let oauthValues = mockSpark.config.credentials.oauth;

      expect(oauthValues.client_id).toEqual(process.env.CISCOSPARK_CLIENT_ID);
      expect(oauthValues.client_secret).toEqual(process.env.CISCOSPARK_CLIENT_SECRET);
      expect(oauthValues.scope).toEqual(process.env.CISCOSPARK_SCOPE);
      expect(oauthValues.redirect_uri).toEqual(process.env.CISCOSPARK_REDIRECT_URI);
    });

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
