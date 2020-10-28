const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const server = require("http").Server(app);
const io = require("socket.io")(server);

var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 

//gpio readall
//const Gpio = require("onoff").Gpio;
//const led = new Gpio(17, "out");
//const route = require("./routes/index");

// function a(){
//   var flag = true;
//   var value = 0;

//   var start = Date.now();
//   for(var i = 0 ; i <256 ; i++){

//     if(flag){
//       value = 1;
//     }else{
//       value = 0;
//     }

//     led.writeSync(value);
//     led.readSync();
//     flag = !flag;
//   }

//   console.log(Date.now() - start);

// };

// a();

var data;
var sample_count = 60;
function initData(){
  var arrays = [];
  for(var i =1 ; i<= sample_count ;i ++){
    arrays.push({
         id : i,
         timestamp : "",
         status : randomInt(2)
      });
  }
  data= arrays;
}

function now(){
  return moment().format("YYYY.MM.DD HH:mm:ss");
}

function randomInt(max) {
  return Math.floor(Math.random() * (max));
}

app.use(cors());
app.use(express.static("build"));
//app.use("/api", route);

server.listen(port, function () {
  console.log(`application is listening on port ${port}...`);
  initData();
});


app.get("/update", function (req, res) { 

  var pos = randomInt(sample_count)
  data[pos].status = randomInt(3);
  data[pos].timestamp = now();
  //io.sockets.emit('update',{ data: data[2]});
  io.sockets.emit('update',data);
  res.send(data);
})


io.on("connection", (socket) => {
  console.log("websocket connected ID : ", socket.id);

  //io.to(socket.id).emit("list", { socketId: socket.id });
  io.to(socket.id).emit("list", data);

  // socket.on("list", (data) => {
  //    io.to(socket.id).emit("list", { socketId: socket.id });
  // });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
