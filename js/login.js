const $ = require('jquery');
const sparkService = require('./sparkService');
require('material-design-lite');


$(() => {
  try{
  	sparkService.authorize().then(() => {
    window.location.pathname = 'index.html';
  }, ()=>alert('SAN FRANCISCO'));
  }catch(err){
  	window.location.pathname = 'index.html';
  }
});
