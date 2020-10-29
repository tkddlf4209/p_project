const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const server = require("http").Server(app);
const io = require("socket.io")(server);
var redis = require('socket.io-redis');
var pm2 = require('pm2');
const {Worker} = require('worker_threads');
var data;


//const route = require("./routes/index");
//gpio readall

app.use(cors());
app.use(express.static("build"));
//app.use("/api", route);

server.listen(port, function () {
  console.log(`application is listening on port@ ${port}...`);
});

//io.adapter(redis({ host: 'localhost', port: 6379 }));
io.on("connection", (socket) => {
  console.log("websocket connected ID : ", socket.id);

  //io.to(socket.id).emit("list", { socketId: socket.id });
  if(data != null){
    io.to(socket.id).emit("list", data);
  }

  // socket.on("list", (data) => {
  //    io.to(socket.id).emit("list", { socketId: socket.id });
  // });

  socket.on("PING",()=>{
    console.log("RECEIVE PING");
    socket.emit('PONG');
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

process.on('message', function(packet) {
  //console.log(packet);
  data = packet.data;
  io.sockets.emit('update',data);
});