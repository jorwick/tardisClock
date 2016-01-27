var piblaster = require('pi-blaster.js');
var Gpio = require('onoff').Gpio;
var i2c = require('i2c');
var Sound = require('node-aplay');
var glob = require("glob");
var CronJob = require('cron').CronJob;
var express = require('express');
var bodyParser = require('body-parser');
var fs    = require('fs');
var nconf = require('nconf');

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream('/home/pi/tardisClock/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

piblaster.setPwm(0, 1); 
piblaster.setPwm(1, 1 ); 

nconf.file({ file: '/home/pi/tardisClock/tardisconfig.json' });

//var myHour=0 ; // test variable- remove...


var MainVol = nconf.get('Volume') ;
var duskThreshold = nconf.get('Sensitivity') ;
var LightsOut = nconf.get('inactive'); // interior light is off ofr any hours in the array 

logInfo('Volume is set to '+ MainVol);
logInfo('Dusk threshold is set to '+ duskThreshold);
logInfo('Inactive Hours are '+ LightsOut);


var activityName = 'none';

var quietPeriod = 0; // if set to 1 indicates no clock chimes

var Light = [0 ,0 ]; // index 0 is interior light state, index 1 is exterior light state
var meterState = 0;// determines state of light meter
var Active = 0; // determines if any action is running
var darkAwhile =0; // determines when to run Materialization and ensures it runs only seldom
var lightAwhile = 0; // determines when to run de-materialization and ensures it runs only seldom


// set up control of i2c AMP
var address = 0x4b
var wire = new i2c(address, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface 

wire.writeByte(MainVol, function(err) {});

// Set up  Web server, post and io sockets
var color // variable for web buttons
//app = express();
//app.use(bodyParser.urlencoded({ extended: true })); 
//server = require('http').createServer(app);
//io = require('socket.io').listen(server);
//server.listen(8080);
//app.use(express.static('/home/pi/node_programs/public'));



//app.post('/setInactive', function(req, res) {
     

//    var timeoutArray;
//    if (typeof req.body.q1_input1 === "undefined")  {
 //     LightsOut.length=0;

   // }else{
    //   timeoutArray= req.body.q1_input1
    //   var i 

   //    for (i = 0; i < timeoutArray.length; i++) {
  //     var temp = timeoutArray[i].split(":");
   //    var last = temp[1];
  //     var desiredHour =Number(temp[0]);
    
  //      if (last.indexOf("pm") > -1) {
  //        desiredHour = desiredHour + 12 ;
  //      }

  //      if (desiredHour == 24) {
  //          desiredHour = 0;
  //      }
     
 //      timeoutArray[i]=desiredHour
 //       }//for 

//    }//else
//    logInfo('New Inactive hours are :' + timeoutArray);
    
 //   LightsOut = timeoutArray;
 //   nconf.set('inactive',LightsOut);
 //   nconf.save(function (err) {
//    fs.readFile('/home/pi/tardisClock/tardisconfig.json', function (err, data) {
 //     console.dir(JSON.parse(data.toString()))
 //   });
//  });
//    res.redirect('back');
//});

//io.sockets.on('connection', function (socket) {
	
  //      socket.on('volume', function (data) {
//		MainVol = data.value;
 //               wire.writeByte(MainVol, function(err) {});
		
//		logInfo('volume is now' + MainVol);
		
//		io.sockets.emit('volume', {value: MainVol});	
//	});
	
//	socket.emit('volume', {value: MainVol});
   

//        socket.on('duskLevel', function (data) {
//		duskThreshold = data.value;
             
		
//		logInfo('Dusk Threshold is is now'+ duskThreshold);
		
//		io.sockets.emit('duskLevel', {value: duskThreshold});	
//	});
	
//	socket.emit('duskLevel', {value: duskThreshold});



//        socket.on('button', function (data) {
//		color = data.value;
 //               logInfo('The ' +color + ' button was pressed'); 
//	        switch (color){
 //                   case 'Cloister Bell':
//                        cloister();
  //                  break;
//                    case 'Dematerialize':
//                         if (Active == 0) {
//                           Active = 1;
//                           takeOff ();
//                           }
//                    break;
//                    case 'Materialize':
//                         if (Active == 0) {
//                          Active = 1;
//                          landing()
//                           }
//                    break;
//                    case 'Themes':
//                          if (Active == 0) {
//                             Active=1;
//                          themes();
//                           } // end if active
//                    break;
//                    default:
//                      ;
//                    }
		
//		io.sockets.emit('button', {value: color});	
//	});
	
//	socket.emit('button', {value: color});

//        setInterval(function () {
//          var statusString = null;
//          var  d = new Date();
  

//          statusString = 'Current Time:' + d.toLocaleTimeString() +'&nbsp;&nbsp;';
//          if ((meterState == 1)  &&  (quietPeriod == 0)) {
//             statusString = '&nbsp;&nbsp;' +statusString + '&nbsp;&nbsp;Interior Lights are ON&nbsp;&nbsp; ' 
//          } else { 
//             statusString = '&nbsp;&nbsp;' + statusString + '&nbsp;&nbsp;Interior Lights are OFF &nbsp;&nbsp;'
//          } // else  meterstate
//          if (Active ==1 ) {
//		statusString = statusString + ' Current State:' +activityName
 //         } //if active

 //         if (quietPeriod == 1) { 
//              statusString = '&nbsp;&nbsp;' + statusString + '&nbsp;&nbsp;Quiet Period Engaged&nbsp;&nbsp;'
 //         }
  
//	  socket.emit('status', {value: statusString}); 
 //        }, 1000); 	
   
//});






// Look in directory for available themes
listOfThemes= glob.sync("/home/pi/Music/DrWhoThemes/*.wav");
logInfo(listOfThemes);


// turn off the lights

piblaster.setPwm(0,0 ); 
piblaster.setPwm(1, 0); 

// configure GPIO for input/output

LightSensor = new Gpio(23, 'low');
var YellowButton = new Gpio(22, 'in', 'falling', { persistentWatch: true, debounceTimeout: 300 });
var RedButton = new Gpio(10, 'in', 'falling', { persistentWatch: true, debounceTimeout: 300 });
var GreenButton = new Gpio(9, 'in', 'falling', { persistentWatch: true, debounceTimeout: 300 });
var BlueButton = new Gpio(11, 'in', 'falling', { persistentWatch: true, debounceTimeout: 300 });

// get RC time of light sensor 

var checkSensor = setInterval(function(){	
// check to see how much light there is
    
 
    var RCStart = getTimeMSFloat (); // get current time
    LightSensor.setDirection('in');
    LightSensor.setEdge('rising');



    var rctimer =  setTimeout(function() { // execute and kill watch if timeout 
      logInfo('10 second Timeout Reached - its dark out.');
      LightSensor.setEdge('none');
      LightSensor.setDirection('out');
      LightSensor.writeSync(0);
      LightSensor.unwatchAll();
      darkAwhile= darkAwhile+1; 
      logInfo ('it has been dark the last '+ darkAwhile + 'checks');
      lightAwhile = 0; 
      darkOut();
      }, 10000);

    var rcwatcher = LightSensor.watch(function (err, value) { // execute when input goes high
      if (err) {
       throw err;
       }
     LightSensor.unwatchAll();
    
     var RCEnd = getTimeMSFloat ();
     var RCTIME = RCEnd - RCStart;
     logInfo('Light is '+ RCTIME);
     if (RCTIME > duskThreshold ) {
       darkAwhile= darkAwhile+1
       logInfo ('it has been dark the last '+ darkAwhile + 'checks');
       lightAwile=0;
     } else {
        lightAwhile=lightAwhile+1;
        darkAwhile=0;
        logInfo ('it has been light out  the last '+ lightAwhile + 'checks');
     }
     darkOut(); // 
    
     // reset pin 
     LightSensor.setEdge('none');
     LightSensor.setDirection('out');
     LightSensor.writeSync(0);
     clearTimeout(rctimer);
     })// end rc watcher
 
 },300000);

// Start the Clock to execute chimes at every hour  mark 
var job = new CronJob('00 00 * * * *', function () {
  clock ();
 });

job.start ();
 

function clock () { // every hour do chimes 

// save config setting every hour 
 nconf.set('Volume',MainVol);
 nconf.set('Sensitivity',duskThreshold);
           
 nconf.save(function (err) {
   fs.readFile('/home/pi/tardisClock/tardisconfig.json', function (err, data) {
    console.dir(JSON.parse(data.toString()))
        });
    });


 var currentdate = new Date();
 var hour =currentdate.getHours();

 

  //myHour = myHour+1;
  //if (myHour == 24){ 
  // myHour =0;
 // } 
  //var hour =myHour;
  logInfo('hour is' + hour);
  
  if (quietPlease(hour)) {; //is it a quiet hour?
         setInteriorLightState ();
         piblaster.setPwm(0, Light[0]);
         piblaster.setPwm(1, Light[1]);
      }else{ 
         setInteriorLightState ();
      }

   if (goFlight()) { // we should chime
     Active = 1;
     
     if (hour == 12) { // its noon- play a theme
        log_file.close // restart the log file 
        log_file = fs.createWriteStream('/home/pi/tardisClock/debug.log', {flags : 'w'});

        themes();
        logInfo('Its Noon!');

     }else { //figure out how many chimes to play 
       
         if (hour >12) {
             hour = hour- 12;
           } // hour > 12

         if (hour == 0)  { // its midnight 
             hour = 12;
           } // hour > 12

         var limit = 1.71 * hour* 1000;
         logInfo('Its '+ hour + ' Oclock - play chimes');
         var chimes = new Sound('/home/pi/Music/tardis_inflight_chimes.wav');
         chimes.play();

         underdamped (1, 0.5, 0, 0, 1.7, 500, 0, 0, chimes);
         underdamped (0, 0, 1, 0, 1.7, 500, 0, 0, chimes);
         
          setTimeout(function () {
          chimes.stop();
           }, limit-800 ); // timeout

     } // play chimes

   } //goflight

} // clock 

     
       



YellowButton.watch(function (err, value) {
  if (err) {
    throw err;
  }
  logInfo ('yellow button was pressed');
  cloister();

 });//yellowbutton watch




 
RedButton.watch(function (err, value) {
  if (err) {
    throw err;
  }
  logInfo ('red button was pressed');
  if (Active == 0) {
     Active = 1;
     takeOff ();
  }
 
 
});


GreenButton.watch(function (err, value) {
  if (err) {
    throw err;
  }
  logInfo ('green button was pressed')
  if (Active == 0) {
     Active = 1;
     landing()
  }
});

BlueButton.watch(function (err, value) {
  if (err) {
    throw err;
  }
  logInfo ('blue button was pressed')
  if (Active == 0) {
    Active=1;
    themes();
  } // end if active
  
});

process.on('SIGINT', exit);



function exit() {

  RedButton.unexport();
  YellowButton.unexport();
  GreenButton.unexport();
  BlueButton.unexport();
  LightSensor.unexport();
  piblaster.setPwm(0, 0 ); 
  piblaster.setPwm(1, 0 );
  process.exit();
}

function getTimeMSFloat () {
    var hrtime = process.hrtime();
    return ( hrtime[0] * 1000000 + hrtime[1] / 1000 ) / 1000;
}

function clip (x, low, high) {
// x is a value to clip within the given range



  if (x < low) {
    x= low;
  };

  if (x > high ) {
    x= high;
  };

 return x;

}



function underdamped (input, amp, offset, damp, period, duration, phase, slope, currentSound) {
// damp is the damping co-efficient (.1 is about right) - if fade out , + if fade in
// period is the period of the desired oscillation
// duration is max duration the signal should be allowed to run. A negative duration indicates to timeshift the function backwards
//Phase indicates if the output should start is oscillation at a value of 1 or 0
// offset adds a set amount to the curve (often it will be 1-2* amp)
// amp is the amplitude of the oscilation at its max ( should be between 0 and 0.5) and will clip if higher
//slope is a linear subtraction or addition to the singal  (based on sign) resulting in absolute ( not breathing) fade

  var flip = 1;
  var timeshift = 0;

  var startPhase= Math.PI*(1-phase);
  if (duration<0) { // then timeshift function by duration
     flip =-1;
    
     duration=Math.abs(duration);
     timeshift=duration;
     }




  // solve for sinusoid period based on damp

  var SinPeriod = Math.sqrt ((period* period) -(damp* damp));


  var startTime = getTimeMSFloat ();

  
  
  var updateDuty = setInterval(function() {
    var timenow = getTimeMSFloat ();
    var value = (timenow - startTime)/1000; // convert to seconds
    var ftime= flip*(value-timeshift)   // add in any time shift and function direction
    var decay = Math.exp(ftime*damp);
    var sinusoid = (Math.cos(((ftime*2*Math.PI)/SinPeriod) + startPhase)+1);
    var fade = slope*ftime + offset;
    var duty = (decay* amp* sinusoid) + fade;
    var duty = clip (duty, 0,1 );
    piblaster.setPwm(input, duty );

    if (Active == 0){
       currentSound.stop();
    }
    

    if ((value > duration) && (duration != 0)) 
    {
      piblaster.setPwm(input, Light [input]);
      
      clearInterval(updateDuty);
      logInfo('terminate signal on input '+ input);
    }

   }, 25); // end setinterval updateduty
  
   currentSound.on('complete', function() {
      logInfo ('music stopped playing');
      clearInterval(updateDuty);
      piblaster.setPwm(input, Light [input]);
      Active = 0;  

   }); // end current sound on 

}


  
function takeOff (){
   Active = 1;
   activityName = 'De-materialize';
   piblaster.setPwm(0, 1 );//input 0 is interior light
   piblaster.setPwm(1, 0 );//input 1 is exterior light  
   //release Brake
   var tardisLeaves = new Sound('/home/pi/Music/tardis_takeoff.wav');
   tardisLeaves.play();

   setTimeout (function(){ 
      underdamped (1, 0.5, 0, -0.12, 1.7, 20, 0, -0.005, tardisLeaves);
      setTimeout ( function () {
	underdamped (0, 0.4, 0.2, -0.12, 1.7, 20, 1, -0.06,  tardisLeaves);
       },850);//timeout
  
   },6059);//timeout
 } // takeOff
  
function landing() { 
  Active = 1;
  activityName = 'Materialize';
  piblaster.setPwm(0, 0 );//input 0 is interior light
  piblaster.setPwm(1, 0 );//input 1 is exterior light
  //release Brake

  var tardisLands = new Sound('/home/pi/Music/tardis_land.wav');
  tardisLands.play();
  Light[0]=1;
  underdamped (1, 0.5, 0, -0.12, 1.7, -19.5, 0, -0.005, tardisLands);
  underdamped (0, 0.4, 0.2, -0.12, 1.7, -19.5, 0, -0.06,  tardisLands);

 }//landing

function randomLight(tmr, currentSound) {
    var duty = Math.random();
    clearTimeout(tmr);
    var duration = Math.round(Math.random()*(100));
    piblaster.setPwm(0, duty);

    if (Active==1) {
       lighteffect  = setTimeout(function() {
          randomLight(tmr,currentSound);
        }, duration);
    }  else {
      currentSound.stop();
      piblaster.setPwm(0, Light[0]);
    } 
  }  //randomlight

function themes() { 

    activityName = 'Themes';
    var top = listOfThemes.length
    logInfo('there are '+ top + ' files');
    var rand = Math.round(Math.random()*(top-1))
    logInfo('playing theme #'+ rand + ' , ' + listOfThemes[rand]);
    var themeSong = new Sound(listOfThemes[rand]);
    themeSong.play();
    underdamped (1, 0.5, 0, 0, 1.7, 500, 0, 0, themeSong);
    underdamped (0, 0, 1, 0, 1.7, 500, 0, 0, themeSong);

} // themes

function cloister() {


  if (Active ==0){
    Active = 1;
    activityName = 'Cloister';
    
    var currentSound = new Sound('/home/pi/Music/Cloister_Bell.wav');
    currentSound.play();
    var soundover=0;

    var tmr = setTimeout (function() {
    randomLight(tmr, currentSound);
    },1);
  
    currentSound.on('complete', function() {
       logInfo ('music stopped playing');
       Active = 0;
     
       clearTimeout(tmr);
     });  // currentsound.on
  } else { // cancel action 
    Active=0;
  }
}

function darkOut () {
 
  logInfo('Active is '+ Active);
  logInfo('quietPeriod is '+ quietPeriod);
  logInfo('meterState is '+ meterState);

  if (lightAwhile == 3 )  {
     meterState=1;
     setInteriorLightState ();


     if (goFlight()) {
         Active =1;
         takeOff();
     } // if

  }//if

  if (darkAwhile == 3)  {

     meterState = 1;
     setInteriorLightState ();
     if (goFlight()) {
       Active = 1;
       landing(); 
      }// if
  }//if 
 

 }// function 


function setInteriorLightState () {

  if (quietPeriod == 1) { // lights are off
      Light[0] = 0;
      Light[1] = 0;
  }else { 
       if (meterState ==1) { 
          Light[0] = 1;
          Light[1] = 0.25

       } else {
          Light[0] = 0;
          Light[1]= 0;

       }//else
   }//else

  return Light[0];
}// function


function quietPlease (now) {

  if (typeof LightsOut === "undefined"){//no hours set
      quietPeriod = 0;
  }else { //some hours are set, is this one of them?
 
    if (LightsOut.indexOf(now)== -1) { // indicate quiet period
       quietPeriod = 0;
       console.log( now, ' is not a quiet hour');
     } else {
       quietPeriod = 1;
       console.log('it is ',now, ' , quiet hours are ', LightsOut) ;
     }//else
   }//else
 return quietPeriod;

}

function goFlight () { // returns true if actioncan be taken
  
        if ((quietPeriod == 1) || (Active ==1))  {
           return false;
        } else{
           return true;
        }
}

function logInfo (d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

           





    