const envJson = require('../.env.json');

const defaultEnv = {
  CISCOSPARK_SCOPE: 'spark:people_read',
  CISCOSPARK_REDIRECT_URI: 'http://localhost:8000/index.html',
  CISCOSPARK_LOG_LEVEL: 'info'
};

let env = Object.assign({}, defaultEnv, envJson);

Object.keys(env).forEach(function(key) {
  process.env[key] = env[key];
});
