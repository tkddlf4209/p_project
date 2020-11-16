module.exports = {
  apps : [{ 
    name        : "server",
    script      : "./server.js",
    instances  : 1,
    exec_mode  : "cluster"
  },{
    name      : "worker",
    script     : "./worker.js"
  }]
};
