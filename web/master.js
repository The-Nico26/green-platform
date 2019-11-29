const config = require('./config');
const events = require('events'),
      net = require('net'),
      JsonSocket = require('json-socket');
/**
 * MODULE CORE WEB
 */

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