const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
var redis = require('socket.io-redis');
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

  socket.on("disconnect", () => {
    console.log("user disconnected");
    deleteSocketId(socket.id);
  });
}); 

process.on('message', function(packet) {
  console.log('conn socket count',conn_socket_ids.length);
  data = packet.data;
  conn_socket_ids.map((id)=>  io.to(id).emit('update',data));

  //io.sockets.emit('update',data);
});