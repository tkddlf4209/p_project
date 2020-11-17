const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const pm2 = require('pm2');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
//var redis = require('socket.io-redis');
const api = require("./routes/api");
const realm = require("./realm/index");
let configs = realm.objects('Config');

//gpio readall 
var data;
var worker_id = -1;

// console.log(configs.map(config =>{
//   console.log(config.id,config.enble);
// }));
//let  = config.filtered('color = "tan" AND name BEGINSWITH "B"');

app.use(cors());
app.use(express.static("build"));
//app.use("/api", api);
app.get('/config', function (req, res) { 
   res.send(configs);
})


async function list () {  
  return new Promise((resolve, reject) => {
    pm2.list((err, res) => {
      if(err){reject(err)} resolve(res)
    })
  })
}


async function connect () {  
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if(err){reject(err)} resolve()
    })
  })
}
server.listen(port, async function () {

  try{
    await connect();
    processes = await list();

    if(processes != null){
      processes.map(process =>{
        if(process.name==="worker"){
          
          worker_id = process.pm_id;
          //console.log('worker id >> ',process.pm_id);
        }
      });
    }
  
  }catch(e){
    console.log('get worker id Error ',e);
  }
  console.log('worker id >> ',worker_id);
  console.log(`application is listening on port@ ${port}...`);
});

//io.adapter(redis({ host: 'localhost', port: 6379 }));
var conn_socket_ids=[];

function deleteSocketId(id) {
  var position = conn_socket_ids.indexOf(id);
  conn_socket_ids.splice(position, 1);
}

io.on("connection", (socket) => {
  console.log("websocket connected ID : ", socket.id);
  conn_socket_ids.push(socket.id);
  //io.to(socket.id).emit("list", { socketId: socket.id });
  if(data != null){
    io.to(socket.id).emit("list", data);
  }

  // socket.on("list", (data) => {
  //    io.to(socket.id).emit("list", { socketId: socket.id });
  // });

  // socket.on("PING",()=>{
  //   console.log("RECEIVE PING");
  //   socket.emit('PONG');
  // });

  socket.on("config", (data) => {
    console.log("#### config ####",data);

    var ids = data.ids;
    var enable = Number(data.enable);

    ids.split(",").map(id => {
      realm.write(() => {
        realm.create('Config', {id: Number(id),enable:enable},true);
      });
    });

    if(worker_id != -1 ){
      pm2.sendDataToProcessId(
      {
        type: 'process:msg',
        data: {
          ids : ids,
          enable : enable==1?true:false
        },
        id: worker_id,
        topic: 'bucket',
      },
        function(error,res) {
          if(error){
          console.log('send Error : ',error,res);
          }
        },
      );
    }

  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    deleteSocketId(socket.id);
  });
}); 

process.on('message', function(packet) {
  //console.log('conn socket count',conn_socket_ids.length);
  //console.log('message update');
  data = packet.data;
  conn_socket_ids.map((id)=>  io.to(id).emit('update',data));
  //console.log(packet.data);
  //io.sockets.emit('update',data);
});
