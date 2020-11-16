var Realm = require('realm');
var realm = new Realm({
  schema: [
    {
      name: 'Config',
      primaryKey:'id',
      properties: 
          {
            id: 'int',
            enable:{
              type:'int',
              default:0
            }
          }
    }
  ]
});

//let configs = realm.objects('Config');

module.exports  =realm;