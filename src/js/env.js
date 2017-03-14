const env = require('../../.env.json');
Object.keys(env).forEach(function(key) {
  process.env[key] = env[key];
});
