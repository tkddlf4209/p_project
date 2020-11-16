const express = require('express');
const router = express.Router();
const realm = require("../realm/index");
let configs = realm.objects('Config');

router.get('/config', function (req, res) { 
  var ids = req.query.ids;
  var enable = Number(req.query.enable);

  ids.split(",").map(id => {
      realm.write(() => {
        realm.create('Config', {id: Number(id),enable:enable},true);
      });
  });

  res.send(configs);
})


router.get('/configInfo', function (req, res) { 
  res.send(configs);
})


module.exports = router;