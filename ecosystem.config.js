module.exports = {
  apps : [{ 
    name        : "server",
    script      : "./server.js",
    watch       : true,
    instances  : 1,
    exec_mode  : "cluster"
  },{
    name      : "worker",
    script     : "./worker.js",
    watch       : true,
  }]
};
