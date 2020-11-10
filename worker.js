var pm2 = require('pm2');
const Gpio = require("onoff").Gpio;
var sleep = require('sleep');
const a0 = new Gpio(5, "out");
const a1 = new Gpio(6, "out");
const a2 = new Gpio(13, "out");
const s0 = new Gpio(16, "out");
const s1 = new Gpio(20, "out");
const s2 = new Gpio(21, "out");


const INA = new Gpio(19, 'in');
const INB = new Gpio(26, 'in');

//const INA = new Gpio(19, 'in', 'both');
//const INB = new Gpio(26, 'in', 'both');

var data;
var sample_count = 6;

var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 

const NORMAL = 0;
const WARNNING = 1;
const DAGNER =2;

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
            processes.forEach(function(process) {
       
            if(process.name==="server"){
              
              //console.log(`Sending message to process with pid: ${process.pm_id}`);
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


// (async () => {
//     pm2.connect(async function(err) {
//         if(err){
//             console.log('err : '+err);
//             return;
//         }
//         var processes = await list();
//         setInterval(function(){
//             var pos = randomInt(sample_count)

//             while(true){
//                 var temp = randomInt(3);
//                 if(data[pos].status != temp){
//                     data[pos].status = temp;
//                     break;
//                 }
//             }
//             data[pos].timestamp = now();

//             processes.forEach(function(process) {
       
//             if(process.name==="server"){
              
//               console.log(`Sending message to process with pid: ${process.pm_id}`);
//               pm2.sendDataToProcessId(
//                   {
//                   type: 'process:msg',
//                   data: data,
//                   id: process.pm_id,
//                   topic: 'bucket',
//                   },
//                   function(error,res) {
//                         //console.log('send Error : '+error);
//                   },
//               );
//              } 
//             });

//         },5000);

       

//     });
// })();

var send_data;
function getStatus(ina, inb){
    /*
                ina(1) inb(0) : 단선
                ina(0) inb(1) : 정상
                ina(0) inb(0) : 화재발생
     */

     if(ina ==1 && inb ==0){
         return WARNNING;
     }else if(ina == 0 && inb == 1){
        return NORMAL;
     }else{
        return DAGNER;
     }
}
// INA.watch((err,value) =>{
//     if(err){
//         console.log('INA error');
//     }else{
//         console.log('INA : ',value);
//     }
// });

// INB.watch((err,value) =>{
//     if(err){
//         console.log('INB error');
//     }else{
//         console.log('INB : ',value);
//     }
// });

var muxCount = 4;
var send_data = [];
function update(init){

    var r_a0 = a0.readSync();
    var r_a1 = a1.readSync();
    var r_a2 = a2.readSync();

    var r_s0 = s0.readSync();
    var r_s1 = s1.readSync();
    var r_s2 = s2.readSync();


    var id = 0;
    for(var i = 0; i < muxCount; i++) {

        s2.writeSync(((i & (1 << 0))>0) >0?1:0);
        s1.writeSync(((i & (1 << 1))>0) >0?1:0);
        s0.writeSync(((i & (1 << 2))>0) >0?1:0);

        for(var j = 0; j < 8; j++){
            a2.writeSync(((j & (1 << 0))>0) >0?1:0);
            a1.writeSync(((j & (1 << 1))>0) >0?1:0);
            a0.writeSync(((j & (1 << 2))>0) >0?1:0);

            var r_a0 = a0.readSync();
            var r_a1 = a1.readSync();
            var r_a2 = a2.readSync();

            var r_s0 = s0.readSync();
            var r_s1 = s1.readSync();
            var r_s2 = s2.readSync();

            var ina = INA.readSync();
            var inb = INB.readSync();


            if(init){
                send_data.push({
                    id : ++id,
                    timestamp : "",
                    status : getStatus(ina,inb)
                });
            }else{
                var tmp = send_data[id++];
                var status = getStatus(ina,inb);
                if(tmp.status != status){
                    tmp.timestamp = now();
                    tmp.status = status;
                }
            }

            console.log("data (a0,a1,a2,s0,s1,s2,INA,INB ) : ",r_a0,r_a1,r_a2,r_s0,r_s1,r_s2,"::::",ina, inb);
            
        }
    }
    console.log(send_data);
}

update(true);  // init send_data
function test(){

    console.log('test');
    var s = 7; // s
    var a = 7; // a

    s2.writeSync(((s & (1 << 0))>0) >0?1:0);
    s1.writeSync(((s & (1 << 1))>0) >0?1:0);
    s0.writeSync(((s & (1 << 2))>0) >0?1:0);

    a2.writeSync(((a & (1 << 0))>0) >0?1:0);
    a1.writeSync(((a & (1 << 1))>0) >0?1:0);
    a0.writeSync(((a & (1 << 2))>0) >0?1:0);

    var r_a0 = a0.readSync();
    var r_a1 = a1.readSync();
    var r_a2 = a2.readSync();

    var r_s0 = s0.readSync();
    var r_s1 = s1.readSync();
    var r_s2 = s2.readSync();

    var ina = INA.readSync();
    var inb = INB.readSync();

    console.log("data (a0,a1,a2,s0,s1,s2,INA,INB ) : ",r_a0,r_a1,r_a2,r_s0,r_s1,r_s2,"::::",ina, inb);
      
}

setInterval(function(){
    //var start = Date.now();
    //update(false); // update send_data
    test();
    //console.log('end', Date.now() - start);
}, 2000);

// start();

//var flag= true; 
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
