const config = require('./config');
const net = require('net'),
      JsonSocket = require('json-socket'),
      events = require('events');

/**
 * INTER PLUGIN
 */

var socket = new JsonSocket(new net.Socket());
var event = new events.EventEmitter();
var uuid;
var database = {};
socket.connect(config.net.port, config.net.host);

socket.on('message', (message)=> {event.emit(
    message.event, 
    {
        data: message.data,
        from: message.from
    })
});

socket.emit = function(event, dt){socket.sendMessage({to: dt.to, event:event, data:dt.data});}


socket.on('connect', ()=>{});
socket.on('close', ()=>{console.log('Server is disconnected');process.exit(0);})

event.on('initPlugin', (packet)=>{
    data = packet.data;
    database = data.database;
    uuid = data.id;    
    socket.emit('init', {
        to: uuid,
        data: {
            name:config.name
        }
    });
});
event.on('updatePlugin', (packet)=>{
  database = packet.data.database;
})

event.on('setup', (packet)=>{
    console.log(packet);
    data = packet.data;

    if(data.config)
        installDBModul(data.name, data.config);
});

/**
 * DATABASE MODULE
 */
var r = require('rethinkdb');

var connectionDB;

r.connect({host: config.database.host, port:config.database.port}, function(err,conn){
    if(err)throw err;
    connectionDB = conn;
    r.dbList().run(connectionDB, (err, res)=>{
        if(!res.includes(config.database.name)){
            r.dbCreate(config.database.name).run(connectionDB, (err,res)=>{
                if(err)throw err;
            });
        }
    })
    if(config.setupDB){
        installDBModul(config.name, config.setupDB);
    }
})

function installDBModul(name, data){
    console.log('install database: '+name);
    var listTable;
    r.db(config.database.name).tableList().run(connectionDB, (err, res)=>{
        if(err)throw err;
        listTable = res;
        for(var index = 0; index < data.length; index++){
            if(!listTable.includes(name+"_"+data[index])){
                r.db(config.database.name).tableCreate(name+"_"+data[index]).run(connectionDB, (err, res)=>{
                    if(err)throw err;
                })
            }
        }
    });
}