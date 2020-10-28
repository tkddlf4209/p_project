const express = require('express');
const router = express.Router();

var i = 0;
//router.get('/', (req, res)=>res.json({username:'bryan~~~'}));

router.get('/', function (req, res) { 
  i++;
  res.send(i+'');
})

module.exports = router;