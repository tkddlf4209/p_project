var pm2 = require('pm2');
const Gpio = require("onoff").Gpio;
var sleep = require('sleep');
//var realm = require('./realm/index'); 
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
const realm = require("./realm/index");
var c = realm.objects('Config');
var configs = {};

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

// function randomInt(max) {
//     return Math.floor(Math.random() * (max));
// }

// function sampleData(){
//   var arrays = [];
//   for(var i =1 ; i<= sample_count ;i ++){
//     arrays.push({
//          id : i,
//          timestamp : "",
//          status : randomInt(2)
//       });
//   }
//   data= arrays;
// }

// sampleData();

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

// (async () => {
//     pm2.connect(async function(err) {
//         if(err){
//             console.log('err : '+err);
//             return;
//         }
//         var processes = await list();
//         setInterval(function(){
//             processes.forEach(function(process) {
       
//             if(process.name==="server"){
              
//               //console.log(`Sending message to process with pid: ${process.pm_id}`);
//               pm2.sendDataToProcessId(
//                   {
//                     type: 'process:msg',
//                     data: data,
//                     id: process.pm_id,
//                     topic: 'bucket',
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
                ina(1) inb(0) : X
                ina(0) inb(1) : 정상 (2.43~22.1V)
                ina(0) inb(0) : 화재발생 (0~2.42V)
                ina(1) inb(1) : 단선 (22.2~24V)
     */

     if(ina ==0 && inb ==0){
        return DAGNER;
     }else if(ina == 0 && inb == 1){
        return NORMAL;
     }else if(ina == 1  && inb == 1){
        return WARNNING;
     }else{
        return NORMAL;
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

var muxCount = 8;
var send_data = [];
function update(init){
    //console.log('----------------------------------------------------');
    var r_a0 = a0.readSync();
    var r_a1 = a1.readSync();
    var r_a2 = a2.readSync();

    var r_s0 = s0.readSync();
    var r_s1 = s1.readSync();
    var r_s2 = s2.readSync();

    var id = 0;
    var diff = false;
    var enable = false;
    for(var i = 0; i < muxCount; i++) {
       
        s0.writeSync(((i & (1 << 0))>0) >0?1:0);
        s1.writeSync(((i & (1 << 1))>0) >0?1:0);
        s2.writeSync(((i & (1 << 2))>0) >0?1:0);

        for(var j = 0; j < 8; j++){
            a0.writeSync(((j & (1 << 0))>0) >0?1:0);
            a1.writeSync(((j & (1 << 1))>0) >0?1:0);
            a2.writeSync(((j & (1 << 2))>0) >0?1:0);
        
            var r_a2 = a2.readSync();
            var r_a1 = a1.readSync();
            var r_a0 = a0.readSync();

            var r_s2 = s2.readSync();
            var r_s1 = s1.readSync();
            var r_s0 = s0.readSync();
    
            var ina = INA.readSync(); 
            var inb = INB.readSync(); 


            if(init){
                if(configs[(id+1)] != undefined){
                    enable = configs[(id+1)]
                }else{
                    enable = false;
                }

                send_data.push({
                    id : (id+1),
                    timestamp : "",
                    status : getStatus(ina,inb),
                    enable : enable
                });
                 console.log("data (a2,a1,a0,s2,s1,s0,INA,INB ) : ",r_a2,r_a1,r_a0,r_s2,r_s1,r_s0,"::::",ina, inb);
            }else{

                var item = send_data[id];
                
                if(configs[(id+1)] != undefined && item.enable != configs[(id+1)]){
                    item.enable = configs[(id+1)];
                    diff =true;
                }

                var new_status = getStatus(ina,inb);
                if(item.status != new_status && item.enable){
                    item.timestamp = now();
                    item.status = new_status;
                    diff = true; 
                    //console.log("data (a2,a1,a0,s2,s1,s0,INA,INB ) : ",r_a2,r_a1,r_a0,r_s2,r_s1,r_s0,"::::",ina, inb);
                }
            }
  
            id++;

            //console.log("data (a2,a1,a0,s2,s1,s0,INA,INB ) : ",r_a2,r_a1,r_a0,r_s2,r_s1,r_s0,"::::",ina, inb);

        }

    }

    if(init){
        sleep.sleep(1);
        sendDataToProcesses(send_data);
    }

    if(diff){
        sendDataToProcesses(send_data);
    }
    //console.log(send_data); 
}

var processes;
async function initProcesses(){
    try{
        await connect();
        processes = await list();
        console.log('processes count -> ', processes.length);
        return true;
    }catch(e){
        return false;
    }
}

function sendDataToProcesses(data){
    if(processes != null){
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
    }
}

function initConfigs(){
    c.map(config =>{
            configs[config.id] = config.enable == 1?true:false;
        }
    );
    console.log('initConfigs >> ',configs);
}

async function start(){
    var init = await initProcesses();

    if(init){
        initConfigs();
        update(true);  // init send_data
	
	setInterval(function(){
	    //console.log("tttt");
            update(false);
        },10);
    
    }else{
        console.log('initProcesses fail');
    }
   
}

setInterval(function(){
    console.log('------------------------------------');
    update(true);
    console.log('------------------------------------');
},3000);

//start();
//test();

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


function test(){
    console.log('test');
    var s = 2; // s
    var a = 6; // a

    //if(flag){
        s0.writeSync(((s & (1 << 0))>0) >0?1:0);
        s1.writeSync(((s & (1 << 1))>0) >0?1:0);
        s2.writeSync(((s & (1 << 2))>0) >0?1:0);
    
        a0.writeSync(((a & (1 << 0))>0) >0?1:0);
        a1.writeSync(((a & (1 << 1))>0) >0?1:0);
        a2.writeSync(((a & (1 << 2))>0) >0?1:0);
    //    flag = false;
    //}
  
    var r_a2 = a2.readSync();
    var r_a1 = a1.readSync();
    var r_a0 = a0.readSync();

    var r_s2 = s2.readSync();
    var r_s1 = s1.readSync();
    var r_s0 = s0.readSync();

    //sleep.msleep(1000);
    var ina = INA.readSync();
    var inb = INB.readSync();

    //INA.writeSync(0);
    //INB.writeSync(0);
    console.log("data (a2,a1,a0,s2,s1,s0,INA,INB ) : ",r_a2,r_a1,r_a0,r_s2,r_s1,r_s0,"::::",ina, inb);
    
}

process.on('message', function(packet) {
    
    var ids = packet.data.ids;
    var enable = packet.data.enable;
    
    ids.split(",").map(id => {
        configs[id] = enable==1?true:false;
    });
    update(false);
});


