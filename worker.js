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
async function list () {  
    return new Promise((resolve, reject) => {
      pm2.list((err, res) => {
        if(err){reject(err)} resolve(res)
      })
    })
 }
(async () => {
    pm2.connect(async function(err) {
        if(err){
            console.log('err : '+err);
            return;
        }
        var processes = await list();
        setInterval(function(){

            var pos = randomInt(sample_count)

            while(true){
                var temp = randomInt(3);
                if(data[pos].status != temp){
                    data[pos].status = temp;
                    break;
                }
            }
            data[pos].timestamp = now();

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
                  function(error,res) {
                        //console.log('send Error : '+error);
                  },
              );
             } 
            });

        },5000);

       

    });
})();

setInterval(function(){
    //console.log(Date.now() - start);
    //console.log("send Message");


    // update random state
   
    

    // send list websocket data


}, 5000);


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
