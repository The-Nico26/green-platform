var config = require('./config'),
    db_plugin = require('./db_plugin'),
    net = require('net'),
    JsonSocket = require('json-socket'),
    events = require('events'),
    uuidv4 = require('uuid/v4');

require('../git');

var server = net.createServer();

server.listen(config.netPort);
console.log("Listen plugin SOCKET://"+config.netPort);
var event = new events.EventEmitter();
db_plugin.core = uuidv4().toString();

server.on('connection', function(socket) {
    socket = new JsonSocket(socket);
    uuid = uuidv4().toString();
    //Receive message => direction plugin concerné
    socket.on('message', (message)=> { 
        console.log('id.'+message.to);
        event.emit('id.'+message.to,{
            to: message.to,
            from: uuid,
            event: message.event,
            data: message.data
        }) 
    });
    //Send message
    socket.emit = function(event, dt){
        this.sendMessage({to: dt.to, from: dt.from, event:event, data:dt.data});
    }

    socket.on('close', ()=>{});

    socket.emit('initPlugin', {
        to: uuid,
        from: db_plugin.core,
        data: {
            id: uuid,
            database: {
                core: db_plugin.core
            }
        }
    })

    event.on('id.'+uuid, (packet)=>{
        data = packet.data;
        switch(packet.event){
            case 'init':
                db_plugin[data.name].push(uuid);
                if(db_plugin.db.length === 0)
                    socket.emit('err', {
                        from: db_plugin.core,
                        to: uuid,
                        data: {
                            msg: 'Plugin database is not loaded'
                        }
                    });
                break;
            default:
                socket.emit(packet.event,{
                    from: packet.from,
                    to: packet.to,
                    data: data
                });
                break;
        }
    });
})