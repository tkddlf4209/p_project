var pm2 = require('pm2');
const Gpio = require("onoff").Gpio;
const led = new Gpio(17, "out");
var start = Date.now();

var data;
var sample_count = 100;

var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 

function now(){
  return moment().format("YYYY.MM.DD HH:mm:ss");
}

function randomInt(max) {
    return Math.floor(Math.random() * (max));
}

function sampleData(){
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
sampleData();

setInterval(function(){
    
    console.log("-- Update --");
    var pos = randomInt(sample_count)
    data[pos].status = randomInt(3);
    data[pos].timestamp = now();
},3000);

setInterval(function(){
    //console.log(Date.now() - start);
    console.log("send Message");

    pm2.connect(function(err) {

    if(err){
        console.log('err : '+err);
    }

    pm2.list(function(err, processes) {
        processes.forEach(function(process) {
          if(process.name==="server"){
            
            console.log(`Sending message to process with pid: ${process.pm_id}`);
            pm2.sendDataToProcessId(
                {
                type: 'process:msg',
                data: data,
                id: process.pm_id,
                topic: 'bucket',
                },
                function(error) {
                      console.log('send Error : '+error);
                },
            );
           } 
        });

        pm2.disconnect();
        });
    });

}, 1000);



// start();

// function start(){
//   var flag = true;
//   var value = 0;
//   while(true){
//     //var start = Date.now();
//     for(var i = 0 ; i <64 ; i++){

//     if(flag){
//       value = 1;
//     }else{
//       value = 0;
//     }

//     led.writeSync(value);
//     led.readSync();
//     flag = !flag;
//     } 
    
//   }
// }
