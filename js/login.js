const $ = require('jquery');
const sparkService = require('./sparkService');

$(()=>{
	if(sparkService.canAuthorize){
    	window.location.pathname = 'index.html';
	}
});

$('#login-button').on('click', () => {
  sparkService.authorize().then(() => {
    window.location.pathname = 'index.html';
  });
});
