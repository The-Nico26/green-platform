var config = require('../config'),
    git = require('simple-git/promise')(__dirname),
    net = require('net'),
    JsonSocket = require('json-socket');

const dns = require('dns')
const { spawn } = require('child_process');


var socket = new JsonSocket(new net.Socket());
socket.connect(config.port_webhook, config.server_webhook);

socket.on('connect', ()=>{
    socket.sendMessage({'secret':config.secret});
    socket.on('message', (html)=>{
        git.checkout(config.branch).then(() => git.pull('origin', 'master', {'--rebase' : 'true'}))
    })
    socket.on('close', (message)=>{
        console.log(message);
        process.exit(0);
    })
})

console.log("Git is start")