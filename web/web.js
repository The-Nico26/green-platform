const config = require('./config');
const events = require('events'),
      net = require('net'),
      JsonSocket = require('json-socket');

//PM2 pour gérer les sous-modules
var pm2 = require('pm2');
pm2.connect((err)=>{
  if (err) {
    console.error(err);
  }

  for(var k in config.modules){
    if(config.modules[k].src !== undefined){
      pm2.start({
        script    : 'src/'+config.modules[k].src+'.js',         // Script to be run
        exec_mode : 'cluster',        // Allows your app to be clustered
      }, function(err, apps) {
        if (err) throw err
      });
      console.log("Start: "+config.modules[k].name);
    }
  }
  
});
/**
 * MODULE CORE WEB
 */

//require("./express/express");

/** INTER PLUGIN */
var socket = new JsonSocket(new net.Socket());
var event = new events.EventEmitter();
var uuid;
var database = {};

socket.connect(config.net.port, config.net.host);

//DEFINE SPECIAL DEFINITION
socket.on('message', (message)=> {event.emit(message.event,
  {
    data: message.data,
    from: message.from
  }
)});

socket.emit = function(event, dt){socket.sendMessage({to:dt.to, event:event, data:data});}

//DEFINE FUNCTION BASIC
socket.on('connect', ()=>{});

socket.on('close', ()=>{console.log('timeout module...'); process.exit(0);})

//PROGRAM
event.on('initPlugin', (packet)=>{
  data = packet.data;
  database = data.database;
  uuid = data.id;
  socket.emit('init', {
    to:uuid,
    data:{
      name:config.name
    }
  })
});
event.on('updatePlugin', (packet)=>{
  database = packet.data.database;
})

event.on('err', (packet)=>{
  data = packet.data;
  console.log(data.msg)
  process.exit(0);
});

var ipc = require('node-ipc');

ipc.config.id = 'platform';
ipc.config.retry = 1500;
ipc.config.silent = true;
let expressSocket; //END POINT WEB_BROWSER


ipc.serve(
  function(){
    ipc.server.on('init', (data, socket)=>{
      if(data.name === 'express')
        expressSocket = socket;
        
    })
    ipc.server.on('url',
      (data, socket)=>{
        ipc.server.broadcast( 'url.'+data.url, {
          action: data.action,
          data: data.data,
          id: data.id
        })
      }
    );

    ipc.server.on('returnHTML', (packet, socket)=>{
        ipc.server.emit(expressSocket, 'id.'+packet.id, {
          data: packet.data
        })
    });

    ipc.server.on(
      'socket.disconnected',
      function(socket, destroyedSocketID){
        console.log('client '+ destroyedSocketID+ ' has disconnected');
      }
    )
  }
)

ipc.server.start();