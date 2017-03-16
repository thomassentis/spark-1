var proxyquire = require('proxyquire');

describe('SparkService', () => {
  var mockSpark, mockCall, mockLocalMediaStream, SparkService = null;

  beforeEach(() => {
    mockCall = {
      on: jasmine.createSpy('on'),
      hangup: jasmine.createSpy('hangup')
    };

    mockLocalMediaStream = {};

    mockSpark = {
      people: {
        list: () => {}
      },
      phone: {
        register: jasmine.createSpy('register'),
        createLocalMediaStream: jasmine.createSpy('createLocalMediaStream')
          .and.returnValue(Promise.resolve(mockLocalMediaStream)),
        dial: jasmine.createSpy('dial').and.returnValue(mockCall)
      }
    };

    SparkService = proxyquire('../src/js/sparkService', { 'ciscospark': mockSpark });
  });

  describe('getUser', () => {
    describe('when given valid user email', () => {
      beforeEach(() => {
        spyOn(mockSpark.people, 'list').and.returnValue(Promise.resolve({ items: ['user'] }));
      });

      it('returns the user', (done) => {
        var email = 'valid@gmail.com';
        SparkService.getUser(email).then((user) => {
          expect(user).toEqual('user');
          expect(mockSpark.people.list).toHaveBeenCalledWith({ email: email });
          done();
        });
      });
    });

    describe('when given invalid user email', () => {
      beforeEach(() => {
        spyOn(mockSpark.people, 'list').and.returnValue(Promise.resolve({ items: [] }));
      });

      it('returns null', (done) => {
        var email = 'invalid@gmail.com';
        SparkService.getUser(email).then((user) => {
          expect(user).toEqual(null);
          expect(mockSpark.people.list).toHaveBeenCalledWith({ email: email });
          done();
        });
      });
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
