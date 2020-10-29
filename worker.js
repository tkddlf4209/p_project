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

console.log("########### START WORKER ###########");

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
    //console.log(Date.now() - start);
    //console.log("send Message");


    // update random state
    var pos = randomInt(sample_count)

    while(true){
        var temp = randomInt(3);
        if(data[pos].status != temp){
            data[pos].status = temp;
            break;
        }
    }
    data[pos].timestamp = now();
    

    // send list websocket data
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

}, 5000);

const init = async () => {
    for (let i=0; i<5; i++){
        console.log(1);
        await sleep(1000);
        console.log(2);
    }
 }
 const sleep = (ms) => {
     return new Promise(resolve=>{
         setTimeout(resolve,ms)
     }) 
 }


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
