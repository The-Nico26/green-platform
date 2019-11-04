var ipc = require('node-ipc');
var uuidv4 = require('uuid/v4');
const config = require('./config');

ipc.config.id = 'express';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo(
    'platform',
    ()=>{
        ipc.of.platform.on(
            'connect',()=>{
                ipc.of.platform.emit('init', {
                   name : config.name 
                })
            });
        ipc.of.platform.on(
            'disconnect',
            ()=>{
                ipc.log('Disconnected from plateform'.notice);
                process.exit(0);
            }
        )
    }
)

/** WEB MODULE */
var express = require('express');
var http = require('http');
var io = require('socket.io');
var app = express();

var serverHttp = http.createServer(app);
var ioListen = io.listen(serverHttp)
serverHttp.listen(config.webPort, ()=>{
  console.log("Module Core-Web is load");
});

app.use('/static', express.static('../ressources'));

app.all(/[a-zA-Z0-9\/-]+/, (req, res)=>{
    if(!(req.originalUrl.substr(0, 8) === '/static/'))
        res.sendFile(__dirname + '/index.html');
});


ioListen.on('connection', function(socket){
    uuid = uuidv4();
    console.log('New client : '+uuid.toString());

    ipc.of.platform.emit('url', {
        id: uuid.toString(),
        action: 'get',
        url: '/'
    });

    socket.on('message', (packet)=>{
        ipc.of.platform.emit('url', {
            url: packet.url,
            action: packet.action,
            data: packet.data,
            id: uuid.toString()
        })
    });

    ipc.of.platform.on('id.'+uuid.toString(), (packet, socketl)=>{
        socket.emit('html', {
            data: packet.data
        });
    })
})