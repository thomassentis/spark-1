const $ = require('jquery');
const sparkService = require('./sparkService');
require('material-design-lite');


$(() => {
  try{
  	sparkService.authorize().catch((err)=>{window.location.pathname = "index.html"} );
  }catch(err){
  	console.log(err.message);
  	
  }
});
